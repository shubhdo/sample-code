const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Status Types
const statusTypes = [
  'active', // subscription is active to be purchased
  'inactive' // subscription is not in use
];

/**********************************************************
 *Schema Structure : SUBSCRIPTIONS
 *********************************************************/
const subscriptionPlanSchema = Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    enum: ['yearly', 'monthly'],
    default: 'monthly'
  },
  maxNumberOfMembers: {
    type: Number,
    default: 0
  },
  features: {
    type: [String]
  },
  isMostPopular: {
    type: Boolean,
    default: false
  },
  stripePlanId: {
    type: String,
    required: true,
    select: false
  },
  status: {
    type: String,
    enum: statusTypes,
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('subscriptions', subscriptionPlanSchema, 'subscriptions');
