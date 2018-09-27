const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const groupMember = require('../models/group-member');

/**********************************************************
 *Schema Structure : GROUPS
 *********************************************************/
const groupsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'organizations'
  },
  members: [groupMember.schema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  }
},
{ timestamps: true });

module.exports = mongoose.model('groups', groupsSchema, 'groups');
