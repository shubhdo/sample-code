const stripe = require('stripe')(process.env.STRIPE_KEY);

// sets proxy configuarion if server protected by proxy.
if (process.env.PROXY) {
  const ProxyAgent = require('https-proxy-agent');
  stripe.setHttpAgent(new ProxyAgent(process.env.PROXY));
}

function cancelSubscriptionPeriodEnd(subscriptionId) {
  return new Promise((resolve, reject) => {
    stripe.subscriptions.del(
      subscriptionId,
      {
        at_period_end: true
      },
      function(err, confirmation) {
        return !err ? resolve(confirmation) : reject(err);
      }
    );
  });
}

function cancelSubscriptionImmediately(subscriptionId) {
  return new Promise((resolve, reject) => {
    stripe.subscriptions.del(subscriptionId, function(err, confirmation) {
      return !err ? resolve(confirmation) : reject(err);
    });
  });
}

function changePlan(currentSubscriptionId, newPlanId) {
  return new Promise(async (resolve, reject) => {
    const subscription = await stripe.subscriptions.retrieve(
      currentSubscriptionId
    );
    const prorationDate = Math.floor(Date.now() / 1000);
    stripe.subscriptions.update(
      currentSubscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            plan: newPlanId
          }
        ],
        proration_date: prorationDate
      },
      function(err, subs) {
        return !err ? resolve(subs) : reject(err);
      }
    );
  });
}

/***********************************************************************************
 * This method takes payment.
 * @param {*} customerId stripe customer id.
 * @param {*} amount number to charge
 **********************************************************************************/
function chargeUser(customerId, amount) {
  return new Promise((resolve, reject) => {
    stripe.charges
      .create({
        amount: amount * 100,
        currency: 'usd',
        customer: customerId
      })
      .then(charge => {
        let chargeInformation = {
          chargeSummary: {
            id: charge.id,
            balance_transaction: charge.balance_transaction,
            source_id: charge.source.id,
            card_last_4: charge.source.last4,
            fingerprint: charge.source.fingerprint,
            name: charge.source.name,
            amount: charge.amount
          },
          charge: charge
        };
        return resolve(chargeInformation);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

function createCard(userStripeId, cardInfo) {
  let tokenId = cardInfo.id;
  return new Promise((resolve, reject) => {
    stripe.customers.createSource(
      userStripeId,
      {
        source: tokenId
      },
      function(err, card) {
        return !err ? resolve(card) : reject(err);
      }
    );
  });
}

/***********************************************************************************
 * This method creates a stripe customer
 * @param {*} token string, token that is received from front end using "Checkout"
 * @param {*} email string, a valid email
 **********************************************************************************/
function createCustomer(token, email) {
  const options = { email: email };
  if (token) {
    options.source = token;
  }
  return new Promise((resolve, reject) => {
    stripe.customers
      .create(options)
      .then(customer => {
        return resolve(customer);
      })
      .catch(err => {
        console.log(err);
        return reject(err);
      });
  });
}

function createPlan(planInfo) {
  return new Promise((resolve, reject) => {
    stripe.plans.create(
      {
        amount: planInfo.price * 100,
        interval: planInfo.duration.replace('ly', ''),
        product: {
          name: planInfo.name,
          statement_descriptor: 'Taskport Subscription'
        },
        currency: 'usd'
      },
      function(err, plan) {
        return !err ? resolve(plan) : reject(err);
      }
    );
  });
}

function createSubscription(stripeCustomerId, stripePlanId) {
  return new Promise((resolve, reject) => {
    stripe.subscriptions.create(
      {
        customer: stripeCustomerId,
        items: [
          {
            plan: stripePlanId
          }
        ]
      },
      function(err, subscription) {
        return !err ? resolve(subscription) : reject(err);
      }
    );
  });
}

function getInvoices(customer, limit = 100, subscription) {
  const options = {
    customer,
    limit,
    subscription
  };
  return new Promise((resolve, reject) => {
    stripe.invoices.list(options, function(err, invoices) {
      return !err ? resolve(invoices) : reject(err);
    });
  });
}

function getCreditCards(customer) {
  return new Promise(async (resolve, reject) => {
    stripe.customers.listCards(customer, function(err, subs) {
      return !err ? resolve(subs) : reject(err);
    });
  });
}

function getCustomer(customerId) {
  return new Promise(async (resolve, reject) => {
    stripe.customers.retrieve(customerId, function(err, customer) {
      return !err ? resolve(customer) : reject(err);
    });
  });
}

function getUpcomingInvoice(customer) {
  return new Promise((resolve, reject) => {
    stripe.invoices.retrieveUpcoming(customer, function(err, upcoming) {
      if (err) {
        if (err.code === 'invoice_upcoming_none') {
          resolve(null);
        }

        reject(err);
      }

      resolve(upcoming);
    });
  });
}

function refund(charge, amount) {
  return new Promise((resolve, reject) => {
    stripe.refunds.create(
      {
        charge,
        amount
      },
      function(err, refund) {
        return !err ? resolve(refund) : reject(err);
      }
    );
  });
}

function setDefaultPaymentSource(customerId, cardId) {
  return new Promise(async (resolve, reject) => {
    stripe.customers.update(
      customerId,
      {
        default_source: cardId
      },
      function(err, customer) {
        return !err ? resolve(customer) : reject(err);
      }
    );
  });
}

function updateCard(userStripeId, cardInfo) {
  return new Promise((resolve, reject) => {
    stripe.customers.updateCard(
      userStripeId,
      cardInfo.id,
      {
        exp_month: cardInfo.month,
        exp_year: cardInfo.year,
        name: cardInfo.cardHolderName
      },
      function(err, card) {
        return !err ? resolve(card) : reject(err);
      }
    );
  });
}

function updatePlan(planId, name) {
  return new Promise((resolve, reject) => {
    stripe.plans.update(
      planId,
      {
        name: name
      },
      function(err, plan) {
        return !err ? resolve(plan) : reject(err);
      }
    );
  });
}

module.exports = {
  cancelSubscriptionImmediately,
  cancelSubscriptionPeriodEnd,
  changePlan,
  chargeUser,
  createCard,
  createCustomer,
  createPlan,
  createSubscription,
  getInvoices,
  getCreditCards,
  getCustomer,
  getUpcomingInvoice,
  refund,
  setDefaultPaymentSource,
  updateCard,
  updatePlan
};
