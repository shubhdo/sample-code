const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sendMail = require('../public/email');

/***************************************************************
 * Schema Structure : CONTACTS
 ***************************************************************/
const contactSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    contact: { // Reference if user is registered already.
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    contactEmail: { // Used as a placeholder for 'contact' while they do not exist as a user yet
        type: String
    },
    relationship: {
        type: Schema.Types.ObjectId,
        ref: 'relationships',
    },
    aliases: {
        type: [String],
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, {
    timestamps: true
});

/***************************************************************************
 * Send 'invited' users an email with instructions for registration
 *
 ***************************************************************************/
contactSchema.post('save', (contact) => {
    const populateQuery = [
        { path: 'user', select: 'name' }
    ];

    contact.populate(populateQuery, (err, res) => {
        sendMail({
            from: process.env.MAILGUN_DEFAULT_SENDER,
            to: [contact.contactEmail],
            subject: 'You have been added as a contact in Taskport!',
            text: `You have been added as a contact by ${res.user.name}\n\nUse the following link register: ${process.env.CLIENT_HOST}/user/register/`
        });
    });
});

module.exports = mongoose.model('contacts', contactSchema, 'contacts');
