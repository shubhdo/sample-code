const Joi = require('joi');

// checks emails array and joins emails with ","
const MailGunArray = Joi.extend((joi) => ({
    base: joi.array(),
    name: 'customArray',
    language: {
        string: 'array must.',
    },
    rules: [{
        name: 'customJoin',
        validate(params, value, state, options) {
            return value.join(', '); // Convert array to email string
        }
    }]
}));

const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAN,
    proxy: process.env.PROXY
});

// Schema definition for the email object to send an email
const schema = Joi.object().keys({
    from: Joi.string().required(),
    to: [
        MailGunArray.customArray()
            .items(Joi.string().email().required())
            .customJoin(),
        Joi.string().email().required()
    ],
    subject: Joi.string().required(),
    text: Joi.string().min(5).required()
});


/********************************************
 * This method is used to send emails.
 * @param {*} data
 ********************************************/
function SendMail(data) {
    Joi.validate(data, schema, (err, value) => {
        if (!err) {
            // Prepend the subject of every email with [Taskport]
            value.subject = '[Taskport] ' + value.subject;

            mailgun.messages().send(value, (error, body) => {
                if (error) {
                    console.log(error);
                }
            });
        } else {
            console.log('SendMail: Invalid parameters.', err);
        }
    });
}

module.exports = SendMail;
