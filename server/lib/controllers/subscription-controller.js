const Organization = require('../models/organization');
const SubscriptionPlan = require('../models/subscription-plan');
const Stripe = require('../controllers/stripe');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;

/**
 * Cancels a subscription for an Organization in our system and Stripe.
 *
 * A plan can be canceled immediately or at the end of the billing period. If
 * canceled immediately, the customer will be refunded a prorated amount.
 *
 */
async function cancelSubscription(req, res) {
  try {
    if (req.body.strategy === 'immediately') {
      let canceledSubscriptionDetail = await Stripe.cancelSubscriptionImmediately(
        req.user.organization.stripeSubscriptionId
      );
      const refundAmount = await calculateRefundAmount(
        req.user,
        canceledSubscriptionDetail.current_period_end
      );
      const refundDetails = await makeRefund(req.user, refundAmount);
      return SendResponse(res, 200, refundDetails);
    } else {
      let canceledSubscriptionDetail = await Stripe.cancelSubscriptionPeriodEnd(
        req.user.organization.stripeSubscriptionId
      );
      return SendResponse(res, 200, canceledSubscriptionDetail);
    }
  } catch (err) {
    console.log(err);
    return SendResponse(res, 500, err);
  }
}

/**
 * Updates the subscription plan for the customer in our system and Stripe.
 *
 */
async function changeSubscriptionPlan(req, res) {
  try {
    const newPlanId = req.params.id;

    const newPlan = await SubscriptionPlan.findOne({
      _id: newPlanId,
      status: 'active'
    },
    'stripePlanId'
    ).exec({});

    if (!newPlan) {
      return SendResponse(res, 404, ['Subscription plan not found']);
    }

    // If customer did not already have a payment method stored, a
    // token generated by stripe checkout will be passed in containing
    // credit card information
    if (req.body.token) {
      await Stripe.createCard(
        req.user.organization.stripeCustomerId,
        req.body.token
      );
    }

    await Stripe.changePlan(
      req.user.organization.stripeSubscriptionId,
      newPlan.stripePlanId
    );

    const condition = {
      _id: req.user.organization._id
    };
    const update = {
      subscription: newPlan._id,
      subscriptionRawData: newPlan
    };

    await Organization.update(condition, update).exec({});
    return SendResponse(res, 200, newPlan);
  } catch (err) {
    console.log(err);
    return SendResponse(res, 500, err);
  }
}

/**
 * Returns the current subscription plan for the organization of the current user
 *
 */
function getSubscriptionPlan(req, res) {
  SubscriptionPlan.findOne({
    _id: req.user.organization.subscription
  }).exec((err, subscriptionPlan) => {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!subscriptionPlan) {
      return SendResponse(res, 404, ['Subscription plan not found']);
    }

    return SendResponse(res, 200, subscriptionPlan);
  });
}

/**
 * Returns a prorated refund amount for the billing period
 *
 */
function calculateRefundAmount(user, currentPeriodEndDate) {
  const planPaymentAmount = user.organization.subscriptionRawData.price,
    totalDaysInSubscriptionPeriod =
      user.organization.subscriptionRawData.duration === 'monthly' ? 30 : 365,
    chargeableAmountPerDay = planPaymentAmount / totalDaysInSubscriptionPeriod,
    totalUnusedDays = calculateUnusedDays(currentPeriodEndDate),
    refundableAmount = Math.round(chargeableAmountPerDay * totalUnusedDays);

  console.log('totalUnusedDays', totalUnusedDays);
  console.log('refundableAmount', refundableAmount);
  return Promise.resolve(refundableAmount);
}

/**
 * Calculated the time remaining in the billing period
 */
function calculateUnusedDays(subscriptionLastDateTimestamp) {
  const millisecondsInOneDay = 1000 * 60 * 60 * 24,
    todayDate = new Date(),
    subscriptionLastDate = new Date(subscriptionLastDateTimestamp * 1000),
    todayDateInMs = todayDate.getTime(),
    subscriptionLastDateInMs = subscriptionLastDate.getTime(),
    differenceInMs = subscriptionLastDateInMs - todayDateInMs;

  return Math.round(differenceInMs / millisecondsInOneDay);
}

/**
 * Calls Stripe to refund the customer
 *
 */
async function makeRefund(user, refundAmount) {
  const userOrg = user.organization;
  try {
    const invoiceForSubscription = await Stripe.getInvoices(
      userOrg.stripeCustomerId,
      1,
      userOrg.stripeSubscriptionId
    );
    const refundAmountInCents = refundAmount * 100; // Stripe takes amount in cents.
    const refundDetails = await Stripe.refund(
      invoiceForSubscription.data[0].charge,
      refundAmountInCents
    );
    return Promise.resolve(refundDetails);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
}

module.exports = {
  cancelSubscription,
  changeSubscriptionPlan,
  getSubscriptionPlan
};