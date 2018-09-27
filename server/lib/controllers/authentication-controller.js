const ShaEncrypt = require('sha256');
const Codes = require('../models/codes');
const Contact = require('../models/contacts');
const Organization = require('../models/organization');
const Session = require('../models/session');
const SubscriptionPlan = require('../models/subscription-plan');
const User = require('../models/user');
const SendMail = require('../public/email');
const Stripe = require('../controllers/stripe');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;
const validCodeQuery = Helper.validCodeQuery;

/***************************************************************************************
 * Register a new organization, user, and customer in Stripe.
 *
 * The user will be sent an email to verify their email address and activate
 * their account.
 *
 ***************************************************************************************/
async function accountRegistration(req, res) {
  try {
    const body = req.body;

    const plan = await SubscriptionPlan.findOne({
      _id: body.subscriptionPlanId,
      status: 'active'
    })
    .select('+stripePlanId')
    .exec({});

    if (!plan) {
      return SendResponse(res, 404, ['Subscription plan not found']);
    }

    // Create customer and subscription in Stripe
    const stripeToken = body.stripe ? body.stripe.stripeToken : null;
    const stripeCustomer = await Stripe.createCustomer(stripeToken, body.email);
    const subscription = await Stripe.createSubscription(
      stripeCustomer.id,
      plan.stripePlanId
    );

    // Create organization
    const organization = await Organization.create({
      name: body.organization,
      subscription: plan._id,
      subscriptionRawData: plan,
      subscriptionBilledAmt: plan.price,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: subscription.id
    });

    // Create user
    body.organization = organization._id;
    body.permissions = {
      isAccountAdmin: true
    };
    const user = await User.create(body);

    // Update organization fields with User data
    await Organization.update(
      {
        _id: organization._id
      },
      {
        $set: {
          createdBy: user._id,
          primaryAdmin: user._id
        }
      }
    ).exec({});

    // Update pending Contacts, if any, with user id
    await Contact.update(
      {
        contactEmail: user.email
      },
      {
        $set: {
          contact: user._id
        }
      },
      {
        multi: true // There might be more than one Contact that requires an update
      }
    ).exec({});

    // Generate activation code and send email to user
    const verificationCode = await generateCode(user._id);
    console.log('Verification code: ', verificationCode.mcode);

    SendMail({
      from: process.env.MAILGUN_DEFAULT_SENDER,
      to: user.email,
      subject: 'Activate Account',
      text: `Hello ${user.name},\n\nWelcome to Taskport! Use the following link to activate your account: ` +
            `${process.env.CLIENT_HOST}/user/activate?code=${encodeURIComponent(verificationCode.mcode)}`
    });

    return SendResponse(res, 204);
  } catch (err) {
    return SendResponse(res, 500, err);
  }
}

/*****************************************************************************************
 * Find an active user based on their email and validates the password. If
 * successfully validated, a session will be created and returned.
 *
 ****************************************************************************************/
function login(req, res) {
  const body = req.body;
  const email = body.email;
  const password = body.password;

  loginUserQuery(email).exec((err, user) => {
    if (err) {
      console.log(err);
      return SendResponse(res, 500, err);
    } else if (!user) {
      return SendResponse(res, 400, ['Invalid username or password']);
    } else {
      return validateUserAndProceed(req, res, user, password);
    }
  });
}

/*****************************************************************************************
 * Log out the user by expiring their session.
 *
 ****************************************************************************************/
function logout(req, res) {
  Session.update(
    {
      token: req.user.token
    },
    {
      status: 'expired'
    },
    (err, session) => {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!session) {
        return SendResponse(res, 404, ['Session not found']);
      }

      return SendResponse(res, 204);
    }
  );
}

/***************************************************************************************
 * Complete registration of member account for an existing organization
 *
 ***************************************************************************************/
function memberRegistration(req, res) {
  User.findOneAndUpdate(
    {
      _id: req.params.id,
      status: 'invited'
    },
    {
      name: req.body.name,
      password: req.body.password,
      status: 'active'
    }
  ).exec((err, user) => {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!user) {
      return SendResponse(res, 404, ['Invalid registration link']);
    }

    return SendResponse(res, 204);
  });
}

/*****************************************************************************************
 * Reset user's password if a valid code is given
 *
 ****************************************************************************************/
function resetPassword(req, res) {
  validCodeQuery(req.params.code, 'password').exec((err, code) => {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!code) {
      return SendResponse(res, 404, ['Invalid or expired code']);
    }

    return updatePassword(res, code.userId, req.body.password);
  });
}

/*****************************************************************************************
 * Find an active user by email and send them a code/link to reset their password
 *
 ****************************************************************************************/
function sendResetPasswordEmail(req, res) {
  let email = req.body.email;

  User.findOne(
    {
      email: email,
      status: 'active'
    },
    (err, user) => {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!user) {
        return SendResponse(res, 404, [
          'No user with the given email address was found'
        ]);
      }

      generateCode(user._id, 'password').then(function(code) {
        let url = `${process.env.CLIENT_HOST}/user/reset-password/${
          code.ecode
        }`;

        SendMail({
          from: process.env.MAILGUN_DEFAULT_SENDER,
          to: email,
          subject: 'Reset Password',
          text: `Hello ${
            user.name
          },\n\nUse the following link to set a new password: ${url}`
        });

        return SendResponse(res, 204);
      });
    }
  );
}

function socialLogin(req, res) {
  loginUserQuery(req.body.email).exec((err, user) => {
    if (err) {
      return SendResponse(res, 500, Error);
    } else if (!user) {
      return SendResponse(res, 404, ['Account does not exist']);
    } else {
      return validateUserAndProceed(
        req,
        res,
        user,
        null,
        req.body.provider.toLowerCase(),
        req.body.authToken
      );
    }
  });
}

/*****************************************************************************************
 * This method generates code to access account and reset password.
 * @param {*} generatedBy This is id of the concern user
 * @param {*} codeType This is type of code. This tells weather the code is to reset password
 ****************************************************************************************/
function generateCode(userId, codeType = 'account') {
  return new Promise((resolve, reject) => {
    Codes.create(
      {
        ecode: ShaEncrypt(Helper.Code() + new Date().valueOf().toString()),
        mcode: Helper.Code(),
        expiredOn: new Date(),
        userId,
        codeType
      },
      (err, code) => {
        if (!err) {
          return resolve(code);
        } else {
          return reject(err);
        }
      }
    );
  });
}

function loginUserQuery(email) {
  const populateQuery = [
    {
      path: 'organization',
      select: 'name'
    }
  ];

  return User.findOne(
    {
      email: email,
      status: 'active'
    },
    'name email password permissions organization avatar'
  ).populate(populateQuery);
}

/***************************************************************************************
 * This method:
 * 1. validates the credentials of the user.
 * 2. creates a session and returns login detail to the user.
 *
 * @param {*} req HTTP Request object
 * @param {*} res HTTP Response object
 * @param {*} user User details fetched from database
 * @param {*} password It is the password that is coming from client side.
 ****************************************************************************************/
function validateUserAndProceed(
  req,
  res,
  user,
  password,
  authTokenProvider = 'taskport',
  token = null
) {
  if (!user) {
    return SendResponse(res, 404, ['Invalid username or password']);
  }
  if (user.status === 'pending') {
    return SendResponse(res, 403, [
      'Account not verified. Check your email for the account verification link.'
    ]);
  }

  user = user.toObject();

  if (user && (token || user.password === ShaEncrypt(password))) {
    return Session.create(
      {
        user: user._id,
        token,
        authTokenProvider,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      },
      (err, session) => {
        if (err) {
          return SendResponse(res, 500, err);
        }

        let response = session.toObject();

        delete user.password;
        delete user.status;
        response.user = user;

        delete response.authTokenProvider;
        delete response.createdAt;
        delete response.ipAddress;
        delete response.updatedAt;
        delete response.userAgent;

        return SendResponse(res, 200, response);
      }
    );
  }

  return SendResponse(res, 401);
}

/*****************************************************************************************
 * Persist a new password for a user
 *
 * @param {*} res HTTP Request object
 * @param {*} userId _id of the user
 * @param {*} newPassword New Password to be set in the DB.
 ****************************************************************************************/
function updatePassword(res, userId, newPassword) {
  return User.update(
    {
      _id: userId
    },
    {
      password: newPassword
    },
    (err, user) => {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!user) {
        return SendResponse(res, 404, ['User not found']);
      }

      return SendResponse(res, 204);
    }
  );
}

module.exports = {
  accountRegistration,
  login,
  logout,
  memberRegistration,
  resetPassword,
  sendResetPasswordEmail,
  socialLogin
};
