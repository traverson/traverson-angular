'use strict';

var chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , events = require('events')
  , EventEmitter = events.EventEmitter
  , testUtil = require('./util')
  , traversonAngular = require('./angular_test_helper');

chai.use(sinonChai);

function RequestMock() {
  EventEmitter.call(this);
}
testUtil.inherits(RequestMock, EventEmitter);

RequestMock.prototype.abort = function() {
    this.emit('abort');
};

describe('Aborting', function() {

  var rootUri = 'http://api.example.org';
  var api = traversonAngular.from(rootUri).json();
  var get;
  var successCallback;
  var errorCallback;

  beforeEach(function() {
    get = sinon.stub();
    api.walker.request = { get: get };
    successCallback = sinon.spy();
    errorCallback = sinon.spy();
  });

  it('should abort the link traversal process', function(done) {
    var path1 = rootUri + '/path/1';
    var path2 = rootUri + '/path/2';

    var root = mockResponse({ link1: path1 });
    var response2 = mockResponse({ link2: path2 });
    var result = mockResponse({ should: 'not reach this' });

    get.returns(new RequestMock());

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, root);
    var secondGet = get
    .withArgs(path1, {}, sinon.match.func);
    secondGet
    .callsArgWithAsync(2, null, response2);

    var handle = api
    .newRequest()
    .follow('link1', 'link2', 'link3')
    .getResource();

    handle.result.then(successCallback, errorCallback);

    waitFor(
      function() {
        return secondGet.called;
      },
      function() {
        handle.abort();
        waitFor(
          function() {
            return errorCallback.called;
          },
          function() {
            assert(errorCallback.calledOnce);
            expect(successCallback).to.not.have.been.called;
            expect(errorCallback).to.have.been.calledWith(sinon.match.
                instanceOf(Error));
            var error = errorCallback.args[0][0];
            expect(error.message)
              .to.equal('Link traversal process has been aborted.');
            done();
          }
        );
      }
    );
  });
});
