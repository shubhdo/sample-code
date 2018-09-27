const Joi = require('joi');

const create = {
  body: {
    contactEmail: Joi.string()
      .email()
      .required(),
    relationship: Joi.string(),
    aliases: Joi.array()
      .allow([])
      .optional()
  }
};

const update = {
  body: {
    _id: Joi.string().required(),
    contactEmail: Joi.string()
      .email()
      .required(),
    relationship: Joi.string(),
    aliases: Joi.array()
      .allow([])
      .optional()
  }
};

module.exports = {
  create,
  update
};
