const Session = require('./models/session');
const SendResponse = require('./public/helper').SendResponse;

/*************************************************************************************
 * This method validates the provided role to access the private api.
 * @param {*} permissions This is the permissions object fetched from the database.
 * @param {*} accessRoles This is the "array"/"string" identifying the API access rights
 ************************************************************************************/
function isValidRole(permissions, accessRoles) {
  let accessRights = (typeof accessRoles === 'string') ? [accessRoles] : accessRoles;
  return accessRights.some((el) => permissions ? permissions[el] : false);
}

/***********************************************************************************
 * This method authenticates private APIs, if applied.
 * This method also adds user information in the request object to process request.
 * @param {*} accessRole string[] | string identifying the role(s) of the user.
 ***********************************************************************************/
function auth(accessRole) {
  return function (req, res, next) {
    let token = req.header('access_code');
    let status = 'active';
    let populateQuery = [{
      path: 'user',
      select: 'name email permissions organization',
      populate: [{
        path: 'organization',
        select: 'name subscription subscriptionRawData subscriptionLastDate stripeCustomerId stripeSubscriptionId',
      }]
    }];

    // Validating an active session exists for the given access code
    Session.findOne({
        token,
        status
      })
      .lean()
      .populate(populateQuery)
      .exec((err, session) => {
          if (err) {
            return SendResponse(res, 500, err);
          }

          if (session) {
            if (accessRole && !isValidRole(session.user.permissions, accessRole)) {
              return SendResponse(res, 403, ['Permission denied']);
            }

            req.user = session.user;
            req.user.token = token;
            return next();
          }

          return SendResponse(res, 401, ['Invalid or expired authentication key']);
      });
  };
}

function authWithPrivateKey() {
  return function (req, res, next) {
    const privateKey = req.header('private_key');
    if (privateKey && privateKey === process.env.PRIVATE_KEY) {
      return next();
    } else {
      return SendResponse(res, 403, ['Permission denied']);
    }
  };
}

module.exports = {
  auth,
  authWithPrivateKey
};
