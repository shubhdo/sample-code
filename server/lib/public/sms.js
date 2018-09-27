/*******************************************
 * Required Library
 *******************************************/
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET,
    proxy: process.env.PROXY
}, {debug: true});

/*******************************************************
 * This method send mobile sms to the specified mobiles.
 * @param {*} mobile
 * @param {*} message
 *******************************************************/
function sendSms(mobile, message) {
    nexmo.message.sendSms(
        process.env.NEXMO_API_FROM, mobile, message,
         {debug: true}, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = sendSms;
