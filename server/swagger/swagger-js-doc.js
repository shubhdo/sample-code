const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  swaggerVersion: '2.0',
  host: 'localhost:3000',
  basePath: '/api',
  schemes: [ 'http', 'https' ],
  info: {
    title: 'Taskport REST API',
    version: '1.0.0',
    contact: {
      'email': 'developers@taskport.us'
    },
    description: '',
  },
  securityDefinitions: {
    ApiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'access_code'
    },
    PrivateKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'private_key'
    }
  },
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  tags: [
  ]
};

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: ['./lib/routes.js']
};

exports.module =  swaggerJSDoc(options);
