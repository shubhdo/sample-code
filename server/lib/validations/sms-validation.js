const Joi = require('joi');

module.exports = {
  body: {
    id: Joi.string().required(),
    message: Joi.string().required()
  },
  headers: {
    private_key: Joi.string().required()
  }
};
