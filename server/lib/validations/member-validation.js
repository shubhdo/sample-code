const Joi = require('joi');

const invite = {
  body: {
    emails: Joi.array().items(Joi.string().email()).required()
  }
};

const update = {
  body: {
    roleTitles: Joi.array().items(Joi.string()),
    status: Joi.string().valid('active', 'deactivated')
  }
};

module.exports = {
  invite,
  update
};
