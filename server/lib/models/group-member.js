const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**********************************************************
 *Enum Structure : ROLE
 *********************************************************/
const groupRole = [
    'LEADER_AND_ADMIN',
    'ADMIN',
    'MEMBER',
    'UNSPECIFIED'
];

/**********************************************************
 *Schema Structure : GROUPS
 *********************************************************/
const groupMemberSchema = new Schema({
    member: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    contact: {
        // KG Note: This is not required
        type: Schema.Types.ObjectId,
        ref: 'contacts'
    },
    role: {
        type: String,
        enum: groupRole,
        default: 'UNSPECIFIED'
    }
},
{ timestamps: true });

module.exports = mongoose.model('group_members', groupMemberSchema, 'group_members');
