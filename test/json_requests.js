/* global angular */
'use strict';

var chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , assert = chai.assert
  , expect = chai.expect
  , traversonAngular = require('./angular_test_helper');

chai.use(sinonChai);

/*
 * Tests for all of Json Walker's request methods except getResource, which is
 * tested extensively in json_get_resource.js. This test suite contains tests
 * for get, post, put, delete and patch. Each http method verb has it's own
 * describe-section. Since most of the code path is the same for getResource
 * and get, post, ..., there are just a few basic tests here for each verb.
 * The getResource tests are more comprehensive.
 */
describe('The JSON client\'s', function() {

  var get;
  var post;
  var put;
  var patch;
  var del;

  var successCallback;
  var errorCallback;

  var rootUri = 'http://api.io';
  var api = traversonAngular.from(rootUri).json();

  var getUri = rootUri + '/link/to/resource';
  var postUri = rootUri + '/post/something/here';
  var putUri = rootUri + '/put/something/here';
  var patchUri = rootUri + '/patch/me';
  var deleteUri = rootUri + '/delete/me';
  var templateUri = rootUri + '/template/{param}';

  var rootResponse = mockResponse({
    'get_link': getUri,
    'post_link': postUri,
    'put_link': putUri,
    'patch_link': patchUri,
    'delete_link': deleteUri,
    'template_link': templateUri
  });

  var result = mockResponse({ result: 'success' });

  var payload = {
    some: 'stuff',
    data: 4711
  };

  beforeEach(function() {
    get = sinon.stub();
    post = sinon.stub();
    put = sinon.stub();
    patch = sinon.stub();
    del = sinon.stub();
    api.requestModuleInstance = {
      get: get,
      post: post,
      put: put,
      patch: patch,
      del: del,
    };
    successCallback = sinon.spy();
    errorCallback = sinon.spy();

    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse, rootResponse.body);
    get
    .withArgs(getUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, result, result.body);
    get
    .withArgs(postUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2,
        new Error('GET is not implemented for this URL, please POST ' +
        'something'));
  });

  describe('get method', function() {

    it('should follow the links', function(done) {
      api
      .newRequest()
      .follow('get_link')
      .get()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(result);
          expect(errorCallback).to.not.have.been.called;
          done();
        }
      );
    });

    it('should call errorCallback with err', function(done) {
      var err = new Error('test error');
      // Default stubbing from beforeEach is not what we want here.
      // IMO, get.reset() should be enough, but isnt?
      get = sinon.stub();
      api.requestModuleInstance = { get: get };
      get.callsArgWithAsync(2, err);

      api
      .newRequest()
      .get()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return errorCallback.called; },
        function() {
          expect(successCallback).to.not.have.been.called;
          expect(errorCallback).to.have.been.calledWith(err);
          done();
        }
      );
    });

    it('should call errorCallback with err when walking along the links fails',
        function(done) {
      var err = new Error('test error');
      // Default stubbing from beforeEach is not what we want here.
      // IMO, get.reset() should be enough, but isnt?
      get = sinon.stub();
      api.requestModuleInstance = { get: get };
      get
      .withArgs(rootUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      get
      .withArgs(getUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('get_link', 'another_link')
      .get()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return errorCallback.called; },
        function() {
          expect(successCallback).to.not.have.been.called;
          expect(errorCallback).to.have.been.calledWith(err);
          done();
        }
      );
    });

  });

  describe('getUrl method', function() {

    it('should follow the links and yield the last URL', function(done) {
      api
      .newRequest()
      .follow('get_link')
      .getUrl()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(getUri);
          expect(errorCallback).to.not.have.been.called;
          expect(get.callCount).to.equal(1);
          done();
        }
      );
    });

    it('should yield resolved URL if last URL is a URI template',
        function(done) {
      api
      .newRequest()
      .follow('template_link')
      .withTemplateParameters({ param: 'substituted' })
      .getUrl()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(
              rootUri + '/template/substituted');
          expect(errorCallback).to.not.have.been.called;
          expect(get.callCount).to.equal(1);
          done();
        }
      );
    });
  });


  describe('post method', function() {

    var result = mockResponse({ result: 'success' }, 201);

    it('should follow the links and post to the last URL',
        function(done) {
      post
      .withArgs(postUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('post_link')
      .post(payload)
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(errorCallback).to.not.have.been.called;
          expect(successCallback).to.have.been.calledWith(result);
          expect(post.firstCall.args[1].body).to.exist;
          expect(post.firstCall.args[1].body).to.contain(payload.some);
          expect(post.firstCall.args[1].body).to.contain(payload.data);
          done();
        }
      );
    });

    it('should call errorCallback with err when post fails',
        function(done) {
      var err = new Error('test error');
      post
      .withArgs(postUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('post_link')
      .post(payload)
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return errorCallback.called; },
        function() {
          expect(errorCallback).to.have.been.calledWith(err);
          expect(successCallback).to.not.have.been.called;
          done();
        }
      );
    });

  });

  describe('put method', function() {

    var result = mockResponse({ result: 'success' }, 200);

    it('should follow the links and put to the last URL',
        function(done) {
      put
      .withArgs(putUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('put_link')
      .put(payload)
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(result);
          expect(errorCallback).to.not.have.been.called;
          expect(put.firstCall.args[1].body).to.exist;
          expect(put.firstCall.args[1].body).to.contain(payload.some);
          expect(put.firstCall.args[1].body).to.contain(payload.data);
          done();
        }
      );
    });

    it('should call errorCallback with err when put fails',
        function(done) {
      var err = new Error('test error');
      put
      .withArgs(putUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('put_link')
      .put(payload)
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return errorCallback.called; },
        function() {
          expect(errorCallback).to.have.been.calledWith(err);
          expect(successCallback).to.not.have.been.called;
          done();
        }
      );
    });
  });

  describe('patch method', function() {

    var result = mockResponse({ result: 'success' }, 200);

    it('should follow the links and patch the last URL',
        function(done) {
      patch
      .withArgs(patchUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('patch_link')
      .patch(payload)
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(result);
          expect(errorCallback).to.not.have.been.called;
          expect(patch.firstCall.args[1].body).to.exist;
          expect(patch.firstCall.args[1].body).to.contain(payload.some);
          expect(patch.firstCall.args[1].body).to.contain(payload.data);
          done();
        }
      );
    });

    it('should call errorCallback with err when patch fails',
        function(done) {
      var err = new Error('test error');
      patch
      .withArgs(patchUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('patch_link')
      .patch(payload)
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return errorCallback.called; },
        function() {
          expect(errorCallback).to.have.been.calledWith(err);
          expect(successCallback).to.not.have.been.called;
          done();
        }
      );
    });
  });

  describe('delete method', function() {

    var result = mockResponse(null, 204);

    it('should follow the links and delete the last URL',
        function(done) {
      del
      .withArgs(deleteUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('delete_link')
      .delete()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(result);
          expect(errorCallback).to.not.have.been.called;
          done();
        }
      );
    });

    it('should call errorCallback with err when deleting fails',
        function(done) {
      var err = new Error('test error');
      del
      .withArgs(deleteUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('delete_link')
      .del()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return errorCallback.called; },
        function() {
          expect(errorCallback).to.have.been.calledWith(err);
          expect(successCallback).to.not.have.been.called;
          done();
        }
      );
    });
  });
});
