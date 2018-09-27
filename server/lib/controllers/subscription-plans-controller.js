const SubscriptionPlan = require('../models/subscription-plan');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;
const Stripe = require('./stripe');

/*********************************************************
 * This method creates new subscription plan.
 * Service Type: PRIVATE
 * This API is accessible only by Supar Admin
 * @param {*} req HTTP Request object
 * @param {*} res HTTP Response object
 ********************************************************/
function createSubscriptionPlan(req, res) {
  let body = req.body;

  Stripe.createPlan(body)
    .then(plan => {
      body.stripePlanId = plan.id;

      SubscriptionPlan.create(body, (err, subscriptionPlan) => {
        if (err) {
          return SendResponse(res, 500, err);
        }

        return SendResponse(res, 201, subscriptionPlan);
      });
    })
    .catch(err => {
      return SendResponse(res, 500, err);
    });
}

/*************************************************
 * This method lists the published plans.
 * @param {*} res HTTP Response object
 * @param {*} req HTTP Request object
 **********************************************/
function getSubscriptionPlans(req, res) {
  var query = {};

  if (req.query.status) {
    query.status = req.query.status == 'active' ? 'active' : 'inactive';
  }

  SubscriptionPlan.find(query)
    .sort({ status: 1, price: 1 })
    .exec(function(err, subscriptionPlans) {
      if (err) {
        return SendResponse(res, 500, err);
      }

      return SendResponse(res, 200, subscriptionPlans);
    });
}

/*************************************************
 * This method gets a subscription plan by id.
 * @param {*} res HTTP Response object
 * @param {*} req HTTP Request object
 **********************************************/
function getSubscriptionPlanById(req, res) {
  SubscriptionPlan.findById(req.params.id)
    .exec(function(err, subscriptionPlan) {
      if (err) {
        return SendResponse(res, 500, err);
      } else if (!subscriptionPlan) {
        return SendResponse(res, 404, ['Subscription plan not found']);
      }

      return SendResponse(res, 200, subscriptionPlan);
    });
}

/*********************************************************
 * This method updates the  subscriptions
 * @param {*} req HTTP Request object
 * @param {*} res HTTP Response object
 ********************************************************/
function updateSubscriptionPlan(req, res) {
  SubscriptionPlan.findById(req.body._id, function(err, subscriptionPlan) {
    if (err) {
      return SendResponse(res, 500, err);
    } else if (!subscriptionPlan) {
      return SendResponse(res, 404, ['Plan not found']);
    }

    // Fields allowed to be modified by this endpoint
    const allowedUpdateFields = [
      'name',
      'description',
      'isMostPopular',
      'status'
    ];
    for (let i = 0; i < allowedUpdateFields.length; i++) {
      const data = req.body[allowedUpdateFields[i]];
      if (data !== undefined) {
        subscriptionPlan[allowedUpdateFields[i]] = data;
      }
    }

    subscriptionPlan.save(function(err, updatedSubscriptionPlan) {
      if (err) {
        return SendResponse(res, 500, err);
      }

      return SendResponse(res, 200, updatedSubscriptionPlan);
    });
  });
}

module.exports = {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan
};
