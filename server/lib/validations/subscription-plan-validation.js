const Joi = require('joi');

const create = {
  body: {
    name: Joi.string().required(),
    description: Joi.string().max(140).required(),
    price: Joi.number().min(0).required(),
    maxNumberOfMembers: Joi.number().integer().min(1).required(),
    duration: Joi.string().valid('monthly', 'yearly').required()
  }
};

const update = {
  body: {
    _id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().max(75).required()
  }
};

module.exports = {
  create,
  update
};
