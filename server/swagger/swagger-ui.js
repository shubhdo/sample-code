const swaggerJsDoc = require('./swagger-js-doc');
const swaggerUi = require('swagger-ui-express');

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc.module, {
    customCss: '.swagger-ui .topbar { display: none } .swagger-container { margin-bottom: 50px }',
    customSiteTitle: 'Taskport REST API'
  }));

  app.get('/api-docs.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerJsDoc.module);
  });
}
