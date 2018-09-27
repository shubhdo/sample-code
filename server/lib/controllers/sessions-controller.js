const Session = require('../models/session');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;

/**
 * Returns all active sessions for the current user
 *
 */
function getUserSessions(req, res) {
  Session.find({
      user: req.user._id,
      status: 'active'
    })
    .exec((err, sessions) => {
      if (err) {
        return SendResponse(res, 500, err);
      }

      return SendResponse(res, 200, sessions);
    });
}

/**
 * Expire all active sessions for the current user, except the session
 * used to make this request.
 *
 */
function forceExpireUserSessions(req, res) {
  Session.update({
      user: req.user._id,
      status: 'active',
      token: {
        $ne: req.user.token // Exclude current session token
      }
    }, {
      status: 'expired'
    }, {
      multi: true
    }, function(err) {
      if (err) {
        return SendResponse(res, 500, err);
      }
      return SendResponse(res, 204);
    });
}

module.exports = {
  forceExpireUserSessions,
  getUserSessions
};
