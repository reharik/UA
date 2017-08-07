const winston = require('winston');
const moment = require('moment');

let messages = async function(ctx) {
  winston.debug('arrived at chat.messages');
  // get user
  let client = await ctx.repository.getByName(ctx.params.name, 'client');

  // filter out expired messages
  let filteredMessages = client.messages
    ? client.messages.filter(x => !x.timeout || moment(x.createdDate).add(x.timeout, 's').isAfter(moment()))
    : [];

    // please don't make me do this
  await ctx.repository.save('client', {userName: ctx.params.name, messages: []});
  // nnnooooooo
  ctx.status = 200;
  ctx.body = filteredMessages;
  return ctx;
};

let createMessage = async function(ctx) {
  winston.debug('arrived at chat.messages');
  // get user
  let client = await ctx.repository.getByName(ctx.params.name, 'client');
  if(!client.userName) {
    client = {userName: ctx.params.name, messages: []};
  }

  // clean old messages
  client.messages = client.messages.filter(x => !x.timeout
      || moment(x.createdDate).add(x.timeout, 's').isAfter(moment()));

  //add createdDate to message and add to client
  let message = Object.assign({}, ctx.request.body, {createdDate: moment().toISOString()});
  client.messages.push(message);

  // persist
  await ctx.repository.save('client', client);
  ctx.status = 201;
  ctx.body = {success: true};
  return ctx;
};

module.exports = {
  messages,
  createMessage
};
