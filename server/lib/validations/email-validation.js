const Joi = require('joi');

module.exports = {
    body: {
        to: [
            Joi.array().items(Joi.string().email().required()).required(),
            Joi.string().email().required()
        ],
        subject: Joi.string().required(),
        message: Joi.string().required()
    },
    headers: {
        private_key: Joi.string().required()
    }
};
