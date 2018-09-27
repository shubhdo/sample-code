const Notification = require('../models/notification');
// const Helper = require('../public/helper');
// const SendResponse = Helper.SendResponse;

/**
 * This method saves notifications
 * @param {*} notification notification data
 */
function saveNotification(notification) {
    Notification.create(notification, (err) => {
        if (err) {
            console.log('Error: Notification is not saved.');
            console.log(err);
        }
    });
}

/**
 * This method updates the message.
 * Service Type: PRIVATE
 * @param {*} req HTTP Request object
 * @param {*} res HTTP Response object
 */
// function updateNotification(req, res) {
//     let messageId = req.body.id;
//     let message = req.body.message;

//     Notification.update({
//         _id: messageId
//     }, {
//             message
//         }, (err, msg) => {
//             if (!err) {
//                 return SendResponse(res, 200, {
//                     message: 'message updated successfully.',
//                     code: 200
//                 }, true);
//             } else {
//                 return SendResponse(res, 500, err);
//             }
//         });
// }

module.exports = {
    saveNotification
};
