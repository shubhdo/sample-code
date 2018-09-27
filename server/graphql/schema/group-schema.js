const { Organization } = require('./oragnization-schema');
const { GroupMember, User } = require('./group-member-schema');
const Group = `
type Group {
    _id:String,
    name:String,
    organization: Organization,
    members: [GroupMember],
    createdBy: User,
    isDeleted: Boolean,
    createdAt:String
}`;

module.exports = { Organization, GroupMember, User, Group };
