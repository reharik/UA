const koarouter = require('koa-router');
const chatController = require('./../../controllers/chatController');

module.exports = function(appRouter) {
  const router = koarouter();
  /**
   * @swagger
   * /messages/{name}:
   *   get:
   *     x-name: messages
   *     description: get messages for specific user
   *     operationId: messages
   *     parameters:
   *       - name: name
   *         in: path
   *         required: true
   *         description: The name of the client messages belong to
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/messages"
   *       422:
   *         description: Failure
   *         schema:
   *             $ref: "#/definitions/standardFailureResponse"
   *       500:
   *         description: Failure
   *         schema:
   *             $ref: "#/definitions/standardFailureResponse"
   */
  router.get('/messages/:name', chatController.messages);
  /**
   * @swagger
   * /messages/{name}:
   *   post:
   *     x-name: massage
   *     description: create a message for a specific user
   *     operationId: message
   *     parameters:
   *       - name: name
   *         in: path
   *         required: true
   *         description: name of the user posting a message
   *         type: string
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           $ref: "#/definitions/message"
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *             $ref: "#/definitions/standardSuccessResponse"
   *       422:
   *         description: Failure
   *         schema:
   *             $ref: "#/definitions/standardFailureResponse"
   *       500:
   *         description: Failure
   *         schema:
   *             $ref: "#/definitions/standardFailureResponse"
   */
  router.post('/messages/:name', chatController.createMessage);


  appRouter.use(router.routes(), router.allowedMethods());
};
