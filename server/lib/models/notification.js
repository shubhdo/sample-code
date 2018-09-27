/**********************************************************
 * Required Library
 *********************************************************/
const socket = require('../socket');
console.log(socket.socket);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Notification Types
const notificationType = [
  'contact_invitation', // invitation to add in contact directory
  'plan_expire_date', // subscribed plan is going to be expired
  'new_plan',// new plan (subscription) is published/launched by super admin
  'plan_renewed', // your plan is renewed
  'invitation_accepted', // invitation is accepted by the invitee
  'welcome_message',// SAAS welcome message
  'invitation_approved_by_admin'// invitation is approved by admin
];

/**********************************************************
 *Schema Structure : NOTIFICATIONS
 *********************************************************/
const notificationSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  recipientEmail: {
    type: String,
    required: true
  },
  notificationType: {
    type: String,
    required: true,
    enum: notificationType
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  rawData: {
    type: Schema.Types.Mixed
  }
}, {
    timestamps: { createdAt: 'notifiedAt' }
  });

/***************************************************************************
 * Post save middilleware that sends notification to the live users.
 ***************************************************************************/
notificationSchema.post('save', function (doc, next) {
  let io = socket.socket();
  io.to(doc._id.toString()).emit('notification', doc);
});

module.exports = mongoose.model('notifications', notificationSchema, 'notifications');
