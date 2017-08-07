const chatController = require('./../../src/controllers/chatController');
const repository = require('./../../src/utilities/repository');
const moment = require('moment');

const td = require('testdouble');
const chai = require('chai');
chai.should();

describe('CHAT_CONTROLLER', function() {

  before(function() {
  });

  beforeEach(function() {
  });

  context('when calling messages on controller', () => {
    context('with a good name', () => {
      it('should return a body with the correct payload', async function() {
        let repo = td.object(repository());
        let message1 = {userName: 'frank', text: "hi mom!"};
        td.when(repo.getByName('frank', 'client')).thenReturn({userName: 'frank', messages: [message1]});
        let result = await chatController.messages({repository: repo, params: {name: 'frank'}});
        result.body.should.be.a('array');
        result.body[0].userName.should.equal(message1.userName);
        result.body[0].text.should.equal(message1.text);
      })
    });
    context('with a bad name', () => {
      it('should return a body with the correct payload', async function() {
        let repo = td.object(repository());
        td.when(repo.getByName('bubba', 'client')).thenReturn({});
        let result = await chatController.messages({repository: repo, params: {name: 'bubba'}});
        result.body.should.be.a('array');
        result.body.should.be.empty;
      })
    });
    context('', () => {
      it('should not return messages that are timed out', async function() {
        let repo = td.object(repository());
        let message1 = {userName: 'frank', text: "hi mom!"};
        let message2 = {
          userName: 'frank',
          text: "loves beans!",
          timeout: "200",
          createdDate: moment().subtract(250, 'seconds').toISOString()
        };
        let message3 = {
          userName: 'frank',
          text: "loves hot dogs!",
          timeout: "200",
          createdDate: moment().subtract(150, 'seconds').toISOString()
        };
        td.when(repo.getByName('frank', 'client')).thenReturn({userName: 'frank', messages: [message1, message2, message3]});
        let result = await chatController.messages({repository: repo, params: {name: 'frank'}});
        result.body.should.be.a('array');
        result.body.length.should.equal(2);
        result.body.filter(x => x.text === message2.text).should.be.empty;
      })
    });

    context('', () => {
      it('should delete retrieved messages', async function() {
        let repo = td.object(repository());
        let message1 = {userName: 'frank', text: "hi mom!"};
        let message2 = {
          userName: 'frank',
          text: "loves beans!",
          timeout: "200",
          createdDate: moment().subtract(250, 'seconds').toISOString()
        };
        let message3 = {
          userName: 'frank',
          text: "loves hot dogs!",
          timeout: "200",
          createdDate: moment().subtract(150, 'seconds').toISOString()
        };
        td.when(repo.getByName('frank', 'client')).thenReturn({userName: 'frank', messages: [message1, message2, message3]});
        let result = await chatController.messages({repository: repo, params: {name: 'frank'}});
        result.body.should.be.a('array');
        result.body.length.should.equal(2);
        td.verify(repo.save('client', {userName: 'frank'}));
      })
    });
  });

  context('when calling createmessage on controller', () => {
    context('for new client', () => {
      it('should persist new message to db with createdDate', async function() {
        let repo = td.object(repository());
        let captor = td.matchers.captor();

        let message1 = {userName: 'frank', text: "hi mom!"};
        let ctx = {repository: repo, params: {name: 'frank'}, request: {body: message1}};
        let message2 = {userName: 'frank', text: "hi mom!", createdDate: moment().toISOString()};
        td.when(repo.getByName('frank', 'client')).thenReturn({userName: 'frank', messages: []});
        let result = await chatController.createMessage(ctx);
        result.status.should.equal(201);
        td.verify(repo.save('client', captor.capture()));
        captor.value.messages.length.should.equal(1);
        captor.value.messages[0].createdDate.should.be.a('string');
      })
    });

    context('for exisiting client', () => {
      it('should persist new message to db with createdDate', async function() {
        let repo = td.object(repository());
        let captor = td.matchers.captor();

        let oldMessage = { userName: 'frank', text: "loves hot dogs!" };
        let message1 = {userName: 'frank', text: "hi mom!"};
        let ctx = {repository: repo, params: {name: 'frank'}, request: {body: message1}};
        td.when(repo.getByName('frank', 'client')).thenReturn({userName: 'frank', messages: [oldMessage]});
        let result = await chatController.createMessage(ctx);
        result.status.should.equal(201);
        td.verify(repo.save('client', captor.capture()));
        captor.value.messages.length.should.equal(2);
        captor.value.messages.find(x => x.text === oldMessage.text).should.be.a('object');
      })
    });

    context('for exisiting client with expired messages', () => {
      it('should persist with out expired messages', async function() {
        let repo = td.object(repository());
        let captor = td.matchers.captor();

        let oldMessage1 = { userName: 'frank', text: "loves hot dogs!" };
        let oldMessage2 = {
          userName: 'frank',
          text: "loves beans!",
          timeout: "200",
          createdDate: moment().subtract(300, 's').toISOString()
        };
        let oldMessage3 = {
          userName: 'frank',
          text: "loves mom!",
          timeout: "200",
          createdDate: moment().toISOString()
        };
        let message1 = {userName: 'frank', text: "hi mom!"};
        let ctx = {repository: repo, params: {name: 'frank'}, request: {body: message1}};
        let message2 = {userName: 'frank', text: "hi mom!", createdDate: moment().toISOString()};
        td.when(repo.getByName('frank', 'client'))
          .thenReturn({userName: 'frank', messages: [oldMessage1, oldMessage2, oldMessage3]});
        let result = await chatController.createMessage(ctx);
        result.status.should.equal(201);

        td.verify(repo.save('client', captor.capture()));
        captor.value.messages.length.should.equal(3);
        captor.value.messages.find(x => x.text === oldMessage3.text).should.be.a('object');
      })
    });
  });
});
