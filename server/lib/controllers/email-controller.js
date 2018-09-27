const { SendResponse } = require('../public/helper');
const User = require('../models/user');

const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAN,
  proxy: process.env.PROXY
});

async function sendMail(req, res) {
  const to = typeof req.body.to === 'string' ? [req.body.to] : req.body.to;
  const condition = {
    email: {
      $in: to
    },
    emailService: false
  };

  try {
    const emailsWithDisabledEmailService = await User.find(condition)
      .distinct('email')
      .exec();

    const emails = to.filter(
      email => !emailsWithDisabledEmailService.includes(email)
    );

    const data = {
      from: process.env.MAILGUN_DEFAULT_SENDER,
      to: emails.join(','),
      subject: req.body.subject,
      text: req.body.message
    };

    // If there are no 'to' emails, return an empty response
    if (data.to.length === 0) {
      return SendResponse(res, 204);
    }

    mailgun.messages().send(data, (error, body) => {
      if (error) {
        console.log(error);
        return SendResponse(res, 500, error);
      }
      return SendResponse(res, 200, body);
    });
  } catch (err) {
    return SendResponse(res, 500, err);
  }
}

module.exports = {
  sendMail
};
