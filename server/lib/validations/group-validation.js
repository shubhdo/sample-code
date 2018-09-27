const Joi = require('joi');

const create = {
  body: {
    name: Joi.string().required()
  }
};

const update = {
  body: {
    _id: Joi.string().required(),
    name: Joi.string().required()
  }
};

module.exports = {
  create,
  update
};
