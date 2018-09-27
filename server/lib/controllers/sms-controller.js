const Helper = require('../public/helper');
const SendResponse = Helper.SendResponse;
const User = require('../models/user');

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET,
    proxy: process.env.PROXY
}, {debug: true});


async function sendSms(req, res) {
  const user = await User.findOne({
      _id: req.body.id,
      smsService: true,
      mobile: {
          $exists: true
      }
  }, 'countryIsdCode mobile');

  if (!user) {
    return SendResponse(res, 404, ['User not found or unsubscribed from SMS notifications']);

  } else {
    nexmo.message.sendSms(
        process.env.NEXMO_API_FROM, user.countryIsdCode + user.mobile, req.body.message,
        {debug: true}, (err) => {
        if (err) {
          console.log(err);
          return SendResponse(res, 500, err);
        }

        return SendResponse(res, 204);
    });
  }
}

module.exports = sendSms;
