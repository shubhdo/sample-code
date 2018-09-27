const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shaEncrypt = require('sha256');
const User = require('./user');

/**********************************************************
 *Schema Structure : SESSIONS
 *********************************************************/
const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  token: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'blocked', 'expired']
  },
  authTokenProvider: { // Keep track record of the auth token provider.
    type: String,
    enum: ['google', 'facebook', 'taskport'],
    default: 'taskport'
  },
  ipAddress: {
    type: String,
    default: null,
    required: true
  },
  userAgent: {
    type: String,
    default: null,
    required: true
  }
}, {timestamps: true});

/**
 * Generate session token to be used for authentication
 */
sessionSchema.pre('save', function (next) {
  this.token = (!this.token) ? shaEncrypt(this.user + new Date().valueOf().toString()) : this.token;
  next();
});

/**
 * Update the the 'lastLogin' for the user
 */
sessionSchema.post('save', function (session) {
  User.update({
    _id: session.user
  }, {
    lastLogin: new Date()
  }, (err, user) => {
    if (err) {
      console.log(err);
    }
  });
});

module.exports = mongoose.model('sessions', sessionSchema, 'sessions');
