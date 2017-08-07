const koarouter = require('koa-router');
const chatRouter = require('./routers/chatRouter');
const swaggerRouter = require('./routers/swaggerRouter');
const winston = require('winston');

module.exports = function(app) {
  try {
    let router = koarouter();

    app.use(router.routes());
    app.use(router.allowedMethods());

    chatRouter(router);
    swaggerRouter(router);
  } catch (ex) {
    winston.error(ex);
  }
};
