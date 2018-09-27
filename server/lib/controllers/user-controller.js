const User = require('../models/user');
const Helper = require('../public/helper');
const validCodeQuery = Helper.validCodeQuery;
const SendResponse = Helper.SendResponse;
const ValidatePassword = Helper.ValidatePassword;
const ShaEncrypt = require('sha256');
const Codes = require('../models/codes');
const SendMail = require('../public/email');

/**********************************************
 * This method activates account
 * @param {*} req Http req object
 * @param {*} res Http res object
 ***********************************************/
function activateAccount(req, res) {
  const update = {
    status: 'active'
  };
  validCodeQuery(req.body.code).exec((err, code) => {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!code) {
      return SendResponse(res, 404, ['Invalid or expired code']);
    }
    // Update user status to 'active'
    User.findOneAndUpdate(
      {
        _id: code.userId,
        status: 'pending'
      },
      update,
      (err, user) => {
        if (err) {
          return SendResponse(res, 500, err);
        } else if (!user) {
          return SendResponse(res, 404, ['User not found']);
        }

        return SendResponse(res, 204);
      }
    );
  });
}

/*****************************************************************************************
 * This method controls the change password flow.
 * @param {*} req HTTP Request object
 * @param {*} res HTTP Response object
 ****************************************************************************************/
function changePassword(req, res) {
  const userId = req.user._id;
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.password;

  return ValidatePassword(currentPassword, userId)
    .then(bool => {
      if (bool) {
        User.update(
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
      } else {
        return SendResponse(res, 400, ['Current password is invalid']);
      }
    })
    .catch(err => {
      return SendResponse(res, 500, err);
    });
}

/******************************************************
 * This method gets the current user's infomation
 * @param {*} req Http req object
 * @param {*} res Http res object
 ******************************************************/
function getUser(req, res) {
  User.findOne({
    _id: req.user._id
  })
    .select('+address +mobile +emailService +smsService')
    .exec((err, user) => {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!user) {
        return SendResponse(res, 404, ['Member not found']);
      }
      return SendResponse(res, 200, user);
    });
}

/******************************************************
 * This method updates the current user's infomation
 * @param {*} req Http req object
 * @param {*} res Http res object
 ******************************************************/
async function updateUser(req, res) {
  const updateData = {};
  const body = req.body;

  if (body && body.email != req.user.email) {
    const verificationCode = await generateCode(req.user._id, 'email', {
      email: body.email
    });
    SendMail({
      from: process.env.MAILGUN_DEFAULT_SENDER,
      to: body.email,
      subject: 'Verify Email Address',
      text: `Hello ${req.user.name},\n\n${
        verificationCode.mcode
      } is your email verification code.`
    });
    delete body.email;
  }

  // Fields allowed to be modified by this endpoint
  const allowedUpdateFields = [
    'name',
    'mobile',
    'address',
    'smsService',
    'emailService'
  ];
  for (let i = 0; i < allowedUpdateFields.length; i++) {
    const data = body[allowedUpdateFields[i]];
    if (data !== undefined) {
      updateData[allowedUpdateFields[i]] = data;
    }
  }

  User.findOneAndUpdate(
    {
      _id: req.user._id
    },
    updateData,
    {
      new: true
    }
  ).exec((err, user) => {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!user) {
      return SendResponse(res, 404, ['Member not found']);
    }

    return SendResponse(res, 200, user);
  });
}

function verifyEmail(req, res) {
  validCodeQuery(req.body.code, 'email').exec((err, code) => {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!code) {
      return SendResponse(res, 404, ['Invalid or expired code']);
    } else if (!code.codeRawData || !code.codeRawData.email) {
      // Never should get here
      return SendResponse(res, 500, ['New email could not be found']);
    }

    const update = {
      email: code.codeRawData.email
    };

    // Update the user's email
    User.findOneAndUpdate(
      {
        _id: code.userId,
        status: 'active'
      },
      update,
      { new: true },
      (err, user) => {
        if (err) {
          return SendResponse(res, 500, err);
        } else if (!user) {
          return SendResponse(res, 404, ['User not found']);
        }

        return SendResponse(res, 204);
      }
    );
  });
}

/*****************************************************************************************
 * This method generates code to access account and reset password.
 * @param {*} generatedBy This is id of the concern user
 * @param {*} codeType This is type of code. This tells weather the code is to reset password
 ****************************************************************************************/
function generateCode(userId, codeType = 'account', codeRawData = null) {
  return new Promise((resolve, reject) => {
    Codes.create(
      {
        ecode: ShaEncrypt(Helper.Code() + new Date().valueOf().toString()),
        mcode: Helper.Code(),
        expiredOn: new Date(),
        userId,
        codeType,
        codeRawData
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

module.exports = {
  activateAccount,
  changePassword,
  getUser,
  updateUser,
  verifyEmail
};
