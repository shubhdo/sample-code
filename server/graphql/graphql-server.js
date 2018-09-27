const graphqlHTTP = require('express-graphql');
const { auth } = require('../lib/auth');

const schema = require('./schema');
module.exports = app => {
  app.use(
    '/graphql',
    auth(),
    graphqlHTTP({
      schema: schema,
      graphiql: true
    })
  );
};
