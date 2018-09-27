const { Contact, User } = require('./contact-schema');

const GroupMember = `
type GroupMember {
    _id:String,
    member: User,
    contact: Contact,
    role: String
}
`;

module.exports = { GroupMember, Contact, User };
