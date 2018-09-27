const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// sets last date of validity of code.
function expireTime(date) {
  return date.setDate(date.getDate() + 1);
}

/**********************************************************
 *Schema Structure : MESSAGES
 *********************************************************/
const codeSchema = new Schema(
  {
    codeType: {
      type: String,
      enum: ['password', 'account', 'twofactorauth', 'email'],
      default: 'password'
    },
    mcode: {
      type: String,
      required: true
    },
    ecode: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    expiredOn: {
      type: Date,
      set: expireTime
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    codeRawData: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('codes', codeSchema, 'codes');
