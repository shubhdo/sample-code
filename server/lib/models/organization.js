const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const addressSchema = require('./address');

/**********************************************************
 *Schema Structure : ACCOUNTS
 *********************************************************/
const orgSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: addressSchema.schema,
    default: addressSchema.schema
  },
  primaryAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    select: false
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'subscriptions'
  },
  subscriptionRawData: {
    type: Schema.Types.Mixed,
    select: false
  },
  subscriptionLastDate: {
    type: Date
  },
  subscriptionBilledAmt: {
    type: Number,
    required: true,
    select: false
  },
  stripeCustomerId: {
    type: String,
    required: true,
    select: false
  },
  stripeSubscriptionId: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('organizations', orgSchema, 'organizations');
