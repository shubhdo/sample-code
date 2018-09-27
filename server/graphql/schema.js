const { User, Organization, Address } = require('./schema/user-schema');
const Subscription = require('./schema/subscription-schema');
const { Contact, Relationship } = require('./schema/contact-schema');
const { Group, GroupMember } = require('./schema/group-schema');
const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');
const Query = `type Query {
  users(organization_id:String): [User],
  user(_id:String!): User,
  organizations: [Organization],
  organization(_id:String!): Organization,
  subscriptions: [Subscription],
  subscription(_id:String!): Subscription,
  contacts(user_id:String): [Contact],
  contact(_id:String!): Contact,
  groups(organization_id:String): [Group],
  group(_id:String!): Group
} `;

const Schema = `
schema {
  query: Query
}
`;
const typeDefs = [
  User,
  Organization,
  Address,
  Subscription,
  Contact,
  Relationship,
  Group,
  GroupMember,
  Query,
  Schema
];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = schema;
