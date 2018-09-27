const { Organization, Address } = require('./oragnization-schema');
const User = `
type Permissions {
    isSuperAdmin: Boolean,
    isAccountAdmin:Boolean
}

type SocialLogin {
    facebookLogin: Boolean,
    googleLogin: Boolean
}

type User {
  _id: String,
  organization: Organization,
  name: String,
  avatar: String
  email: String,
  password: String,
  roleTitles: [String],
  mobile: String,
  countryIsdCode: String,
  address: Address,
  emailService: Boolean,
  smsService: Boolean,
  isPolicyAccepted: Boolean,
  permissions: Permissions,
  socialLoginPermission: SocialLogin,
  lastLogin: String,
  createdBy: User,
  status: String
}`;

module.exports = { Organization, Address, User };
