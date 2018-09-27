const OrganizationSchema = require('../lib/models/organization');
const UserSchema = require('../lib/models/user');
const SubscriptionSchema = require('../lib/models/subscription-plan');
const ContactSchema = require('../lib/models/contacts');
const GroupSchema = require('../lib/models/groups');
const mongoose = require('mongoose');

const resolvers = {
  Query: {
    users: async (root, { organization_id }) => {
      const users = await UserSchema.find({
        organization: mongoose.Types.ObjectId(organization_id)
      });
      return users;
    },
    user: async (root, { _id }) => {
      const user = await UserSchema.findById(_id).select(
        '+address +mobile +emailService +smsService'
      );
      return user;
    },
    organizations: async () => {
      const organizations = await OrganizationSchema.find({}).populate(
        'address'
      );
      return organizations;
    },
    organization: async (root, { _id }) => {
      return await OrganizationSchema.findById(_id);
    },
    subscriptions: async () => {
      const subscriptions = await SubscriptionSchema.find({});
      return subscriptions;
    },
    subscription: async (root, { _id }) => {
      return await SubscriptionSchema.findById(_id);
    },
    contacts: async (root, { user_id }) => {
      const contacts = await ContactSchema.find({ user: user_id }).populate(
        'user contact relationship'
      );
      return contacts;
    },
    contact: async (root, { _id }) => {
      return await ContactSchema.findById(_id).populate(
        'user contact relationship'
      );
    },
    groups: async (root, { organization_id }) => {
      const groups = await GroupSchema.find({
        organization: organization_id
      })
        .populate('createdBy', 'name')
        .populate('members.member', 'name')
        .populate('members.contact', 'alias name');
      return groups;
    },
    group: async (root, { _id }) => {
      return await GroupSchema.findById(_id).populate(
        'organization members createdBy'
      );
    }
  }
};

module.exports = resolvers;
