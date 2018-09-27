const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const md5 = require('md5');
const shaEncrypt = require('sha256');
const addressSchema = require('./address');
const sendMail = require('../public/email');

// Status Types
const StatusTypes = [
  'active', // user account is "active".
  'deactivated', // user has deactivated the account.
  'pending', // user account is not verified
  'invited'
];

/**********************************************************
 *Child Schema Structure : PERMISSIONS
 *********************************************************/
const permissionsSchema = new Schema({
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  isAccountAdmin: {
    type: Boolean,
    default: false
  }
});

/**********************************************************
 *Child Schema Structure : SOCIAL_LOGIN
 *********************************************************/
const socialLoginSchema = new Schema({
  facebookLogin: {
    type: Boolean,
    default: true
  },
  googleLogin: {
    type: Boolean,
    default: true
  }
});

/**********************************************************
 *Schema Structure : USER
 *********************************************************/
const userSchema = new Schema(
  {
    organization: {
      type: Schema.Types.Mixed,
      ref: 'organizations',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false,
      set: shaEncrypt
    },
    roleTitles: {
      type: [String]
    },
    mobile: {
      type: String,
      required: false,
      select: false
    },
    countryIsdCode: {
      type: String,
      default: process.env.DEFAULT_ISD_CODE,
      select: false
    },
    address: {
      type: addressSchema.schema,
      default: addressSchema.schema,
      select: false
    },
    emailService: {
      type: Boolean,
      default: true,
      select: false
    },
    smsService: {
      type: Boolean,
      default: false,
      select: false
    },
    isPolicyAccepted: {
      type: Boolean,
      required: true,
      default: false,
      select: false
    },
    permissions: {
      type: permissionsSchema,
      default: permissionsSchema
    },
    socialLoginPermission: {
      type: socialLoginSchema,
      default: socialLoginSchema,
      select: false
    },
    lastLogin: {
      type: Date
    },
    createdBy: {
      type: Schema.Types.Mixed,
      ref: 'users',
      select: false
    },
    status: {
      type: String,
      enum: StatusTypes,
      default: 'pending'
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

/**
 * Virtual field to return the user's avatar.
 *
 * Currently, only gravatar is supported: http://en.gravatar.com/site/implement/hash/
 */
userSchema.virtual('avatar').get(function() {
  if (this.email) {
    return (
      'https://www.gravatar.com/avatar/' +
      md5(this.email.trim().toLowerCase()) +
      '?s=30&d=mm'
    );
  }

  return '';
});

/***************************************************************************
 * Send 'invited' users an email with instructions for registration
 *
 ***************************************************************************/
userSchema.post('save', user => {
  if (user.status === 'invited') {
    const populateQuery = [
      { path: 'createdBy', select: 'name' },
      { path: 'organization', select: 'name' }
    ];

    user.populate(populateQuery, (err, res) => {
      console.log(
        `Invite link: ${process.env.CLIENT_HOST}/user/register/${
          res._id
        }?organization=${encodeURIComponent(res.organization.name)}`
      );

      sendMail({
        from: process.env.MAILGUN_DEFAULT_SENDER,
        to: [user.email],
        subject: 'You have been added as a member in Taskport!',
        text: `You have been added as a member to ${
          res.organization.name
        }'s account by ${
          res.createdBy.name
        }.\n\nUse the following link to complete registration: ${
          process.env.CLIENT_HOST
        }/user/register/${res._id}?organization=${encodeURIComponent(
          res.organization.name
        )}`
      });
    });
  }
});

module.exports = mongoose.model('users', userSchema, 'users');
