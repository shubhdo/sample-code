const Address = require('./address-schema');
const Subscription = require('./subscription-schema');
const Organization = `type Organization {
  _id:String
  name: String,
  address: Address,
  primaryAdmin: String,
  createdBy: User,
  subscription: Subscription,
  subscriptionRawData: String,
  subscriptionLastDate: String,
  subscriptionBilledAmt: Int,
  stripeCustomerId: String,
  stripeSubscriptionId: String 
}`;

module.exports = { Organization, Address, Subscription };
