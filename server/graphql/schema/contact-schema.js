const { User } = require('./user-schema');
const Relationship = require('./relationship-schema');
const Contact = `
type Contact {
    user: User,
    contact: User,
    contactEmail: String,
    relationship: Relationship,
    aliases: [String],
    isDeleted:Boolean
}`;

module.exports = { Contact, Relationship, User };
