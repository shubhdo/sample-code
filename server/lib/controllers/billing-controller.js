const Stripe = require('../controllers/stripe');
const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;

/**
 * Saves a credit card as a payment method in Stripe
 *
 */
async function addCreditCard(req, res) {
  try {
    const creditCard = await Stripe.createCard(
      req.user.organization.stripeCustomerId,
      req.body
    );
    return SendResponse(res, 201, getCreditCardObject(creditCard));
  } catch (err) {
    return SendResponse(res, 500, err);
  }
}

/**
 * Returns a list of credit cards from Stripe. The default credit card to use is
 * also returned.
 *
 */
async function getCreditCards(req, res) {
  try {
    const stripeCustomerId = req.user.organization.stripeCustomerId;
    const customer = await Stripe.getCustomer(stripeCustomerId);
    const stripeCreditCards = await Stripe.getCreditCards(stripeCustomerId);
    const creditCards = [];

    // Return a subset of fields from Stripe's API response
    for (let creditCard of stripeCreditCards.data) {
      creditCards.push(
        getCreditCardObject(creditCard, customer.default_source)
      );
    }

    return SendResponse(res, 200, creditCards);
  } catch (err) {
    console.log('error', err);
    return SendResponse(res, 500, err);
  }
}

/**
 * Returns invoices for a customer
 *
 */
async function getInvoices(req, res) {
  try {
    const stripeInvoices = await Stripe.getInvoices(
      req.user.organization.stripeCustomerId
    );
    const invoices = [];

    // Return a subset of fields from Stripe's API response
    for (let invoice of stripeInvoices.data) {
      const items = [];

      for (let item of invoice.lines.data) {
        items.push({
          description: item.description
        });
      }

      invoices.push({
        number: invoice.number,
        date: invoice.date,
        items: items,
        total: invoice.total
      });
    }

    return SendResponse(res, 200, invoices);
  } catch (err) {
    return SendResponse(res, 500, err);
  }
}

/**
 * Returns a customer's upcoming invoice
 *
 */
async function getUpcomingInvoice(req, res) {
  try {
    const stripeInvoice = await Stripe.getUpcomingInvoice(
      req.user.organization.stripeCustomerId
    );
    const items = [];

    for (let item of stripeInvoice.lines.data) {
      items.push({
        description: item.description
      });
    }

    // Return a subset of fields from Stripe's API response
    const invoice = {
      number: stripeInvoice.number,
      next_payment_attempt: stripeInvoice.next_payment_attempt,
      items: items,
      total: stripeInvoice.total
    };

    return SendResponse(res, 200, invoice);
  } catch (err) {
    return SendResponse(res, 500, err);
  }
}

/**
 * Updates a credit card in Stripe.
 *
 * The cardholder name, expiration date can be updated. The payment method
 * can also be set as the default.
 *
 */
async function updateCreditCard(req, res) {
  try {
    const stripeCustomerId = req.user.organization.stripeCustomerId;

    // Set payment method as default if requested
    if (req.body.setDefaultSource) {
      Stripe.setDefaultPaymentSource(stripeCustomerId, req.body.id);
    }

    const creditCard = await Stripe.updateCard(stripeCustomerId, req.body);
    return SendResponse(res, 200, getCreditCardObject(creditCard));
  } catch (err) {
    if (err.code === 'invalid_expiry_month') {
      return SendResponse(res, 400, [
        "Your card's expiration month is invalid."
      ]);
    }

    return SendResponse(res, 500, err);
  }
}

/**
 * Returns an object containing a subset of fields from
 * Stripe's credit card model
 *
 * @param {*} stripeCreditCard Object returned by Stripe's API
 * @param {*} defaultId Id of the default payment method
 */
function getCreditCardObject(stripeCreditCard, defaultId) {
  const creditCard = {
    id: stripeCreditCard.id,
    name: stripeCreditCard.name,
    brand: stripeCreditCard.brand,
    last4: stripeCreditCard.last4,
    exp_month: stripeCreditCard.exp_month,
    exp_year: stripeCreditCard.exp_year
  };

  if (defaultId && stripeCreditCard.id == defaultId) {
    creditCard.default = true;
  }

  return creditCard;
}

module.exports = {
  addCreditCard,
  getCreditCards,
  getInvoices,
  getUpcomingInvoice,
  updateCreditCard
};
