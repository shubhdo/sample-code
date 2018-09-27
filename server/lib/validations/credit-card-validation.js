const Joi = require('joi');

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

module.exports = {
  body: {
    id: Joi.string().required(),
    cardHolderName: Joi.string().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().greater(currentYear - 1).required(),
    setDefaultSource: Joi.boolean()
  }
};
