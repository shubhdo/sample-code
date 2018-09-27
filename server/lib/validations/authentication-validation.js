const Joi = require('joi');

const passwordMinLength = 6,
      passwordMaxLength = 30;

const AuthJoi = Joi.extend((joi) => ({
  base: joi.string(),
  name: 'auth',
  language: {
    confirmPasswordMatch: 'Confirm password does not match password'
  },
  rules: [{
      name: 'confirmPasswordMatch',
      validate(params, value, state, options) {
        return (state.parent.password === value) ?
            value :
            this.createError('auth.confirmPasswordMatch', {
                v: value
            }, state, options);
      }
  }]
}));

const accountRegistration = {
  body: {
    subscriptionPlanId: Joi.string().required(),
    name: Joi.string().min(3).max(30).required(),
    organization: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(passwordMinLength).max(passwordMaxLength).required(),
    confirmPassword: AuthJoi.auth().confirmPasswordMatch().required(),
    stripe: Joi.object({
      stripeToken: Joi.string().required()
    }),
    isPolicyAccepted: Joi.boolean().valid(true).required()
  }
};

const changePassword = {
  body: {
    currentPassword: Joi.string().required(),
    password: Joi.string().min(passwordMinLength).max(passwordMaxLength).required(),
    confirmPassword: AuthJoi.auth().confirmPasswordMatch().required()
  }
};

const login = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }
};

const memberRegistration = {
  body: {
    name: Joi.string().min(3).max(30).required(),
    password: Joi.string().required(),
    confirmPassword: AuthJoi.auth().confirmPasswordMatch().min(passwordMinLength).max(passwordMaxLength).required()
  }
};

const resetPassword = {
  body: {
    password: Joi.string().min(passwordMinLength).max(passwordMaxLength).required(),
    confirmPassword: AuthJoi.auth().confirmPasswordMatch().required()
  }
};

const resetPasswordEmail = {
  body: {
    email: Joi.string().email().required()
  }
};

const verifyEmailCode = {
  body: {
    code: Joi.string().min(6).max(6).required()
  }
};

module.exports = {
  accountRegistration,
  changePassword,
  login,
  memberRegistration,
  resetPassword,
  resetPasswordEmail,
  verifyEmailCode
};
