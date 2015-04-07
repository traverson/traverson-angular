/* global angular */
/* jshint maxparams: 6 */
/* jshint maxcomplexity: 12 */

'use strict';

var util = require('util')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect
  , traversonAngular = require('./angular_test_helper');

chai.use(sinonChai);

// TODOs:
// - error handling in a continued traversal
// - cloning with traversal.continue().newRequest(), splitting into multiple
//   follow up traversals
// - abort a continuation
// - mixed continuations (first with getResource second with get or vice versa
//   plus other combinations, getUrl, post, ...)

describe('Continuation of traversals', function() {

  var get;
  var post;
  var put;
  var patch;
  var del;

  var successCallback1;
  var successCallback2;
  var errorCallback1;
  var errorCallback2;

  var rootUrl = 'http://api.example.org';
  var api = traversonAngular.from(rootUrl).json();

  var url1 = rootUrl + '/1';
  var rootResponse = mockResponse({ link1: url1 });
  var url2 = rootUrl + '/2';
  var response2 = mockResponse({ link2: url2 });
  var url3 = rootUrl + '/3';
  var response3 = mockResponse({ link3: url3 });
  var response4 = mockResponse({ foo: 'bar' });

  var payload = { some: 'stuff' };

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
    successCallback1 = sinon.spy();
    successCallback2 = sinon.spy();
    errorCallback1 = sinon.spy();
    errorCallback2 = sinon.spy();
    setupMocks();
  });

  describe('get', function() {
    defineTestsForMethod(api.get);
  });

  describe('getResource', function() {
    defineTestsForMethod(api.getResource);
  });

  describe('getUrl', function() {
    defineTestsForMethod(api.getUrl);
  });

  describe('post', function() {
    defineTestsForMethod(api.post, payload);
  });

  describe('put', function() {
    defineTestsForMethod(api.put, payload);
  });

  describe('patch', function() {
    defineTestsForMethod(api.patch, payload);
  });

  describe('delete', function() {
    defineTestsForMethod(api.delete);
  });

  function defineTestsForMethod(method, body) {

    it('should continue with links after a no-link traversal',
        function(done) {
      setupTest(
        method,
        body,
        [],
        ['link1', 'link2', 'link3'], {
          method: method,
          firstResponse: rootResponse,
          secondResponse: response4,
          expectedUrl1: rootUrl,
          expectedUrl2: url3,
          expectedNumberOfHttpGetRequests: 4,
          noLinksForSecondTraversal: false,
        }, done);
    });

    it('should continue with a link (1|1)', function(done) {
      setupTest(
        method,
        body,
        ['link1'],
        ['link2'], {
          method: method,
          firstResponse: response2,
          secondResponse: response3,
          expectedUrl1: url1,
          expectedUrl2: url2,
          expectedNumberOfHttpGetRequests: 3,
          noLinksForSecondTraversal: false,
        }, done);
    });

    it('should continue with a link (2|1)', function(done) {
      setupTest(
        method,
        body,
        ['link1', 'link2'],
        ['link3'], {
          method: method,
          firstResponse: response3,
          secondResponse: response4,
          expectedUrl1: url2,
          expectedUrl2: url3,
          expectedNumberOfHttpGetRequests: 4,
          noLinksForSecondTraversal: false,
        }, done);
    });

    it('should continue with a link (1|2)', function(done) {
      setupTest(
        method,
        body,
        ['link1'],
        ['link2', 'link3'], {
          method: method,
          firstResponse: response2,
          secondResponse: response4,
          expectedUrl1: url1,
          expectedUrl2: url3,
          expectedNumberOfHttpGetRequests: 4,
          noLinksForSecondTraversal: false,
        }, done);
    });

    it('should continue with no links', function(done) {
      setupTest(
        method,
        body,
        ['link1', 'link2', 'link3'],
        [], {
          method: method,
          firstResponse: response4,
          secondResponse: response4,
          expectedUrl1: url3,
          expectedUrl2: url3,
          expectedNumberOfHttpGetRequests: 4,
          noLinksForSecondTraversal: true,
        }, done);
    });

    it('should continue with no links after a no-link traversal',
        function(done) {
      setupTest(
        method,
        body,
        [],
        [], {
          method: method,
          firstResponse: rootResponse,
          secondResponse: rootResponse,
          expectedUrl1: rootUrl,
          expectedUrl2: rootUrl,
          expectedNumberOfHttpGetRequests: 1,
          noLinksForSecondTraversal: true,
        }, done);
    });

  } // function defineTestsForMethod

  function setupMocks() {
    [get, post, put, patch, del].forEach(function(fn) {
      fn
      .withArgs(rootUrl, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      fn
      .withArgs(url1, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, response2);
      fn
      .withArgs(url2, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, response3);
      fn
      .withArgs(url3, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, response4);
    });
  }

  function setupTest(method, body, links1, links2, results, done) {
    var builder = api.newRequest().follow(links1);

    var request = method.apply(builder, (body ? [body] : []));
    request.result.then(successCallback1, errorCallback1);

    request.continue().then(function(nextBuilder) {
      nextBuilder.follow(links2);
      method
      .apply(nextBuilder, (body ? [body] : []))
      .result
      .then(successCallback2, errorCallback2);
    });

    waitFor(
      function() {
        return successCallback1.called &&
               successCallback2.called;
      },
      function() {
        checkResult(results);
        done();
      }
    );
  }

  function checkResult(results) {
    expect(errorCallback1).to.not.have.been.called;
    expect(errorCallback2).to.not.have.been.called;
    if (results.method === api.get) {
      expect(successCallback1).to.have.been.calledWith(
        results.firstResponse);
      expect(successCallback2).to.have.been.calledWith(
        results.secondResponse);
      expect(get.callCount).to.equal(results.expectedNumberOfHttpGetRequests);
    } else if (results.method === api.getResource) {
      expect(successCallback1).to.have.been.calledWith(
        results.firstResponse.doc);
      expect(successCallback2).to.have.been.calledWith(
        results.secondResponse.doc);
      expect(get.callCount).to.equal(results.expectedNumberOfHttpGetRequests);
    } else if (results.method === api.getUrl) {
      expect(successCallback1).to.have.been.calledWith(
        results.expectedUrl1);
      expect(successCallback2).to.have.been.calledWith(
        results.expectedUrl2);
      expect(get.callCount).to.equal(
        results.expectedNumberOfHttpGetRequests - 1);
    } else if (results.method === api.post) {
      expect(successCallback1).to.have.been.calledWith(
        results.firstResponse);
      expect(successCallback2).to.have.been.calledWith(
        results.secondResponse);
      expect(get.callCount).to.equal(results.expectedNumberOfHttpGetRequests -
         (results.noLinksForSecondTraversal ? 1 : 2));
      expect(post.callCount).to.equal(2);
    } else if (results.method === api.put) {
      expect(successCallback1).to.have.been.calledWith(
        results.firstResponse);
      expect(successCallback2).to.have.been.calledWith(
        results.secondResponse);
      expect(get.callCount).to.equal(results.expectedNumberOfHttpGetRequests -
         (results.noLinksForSecondTraversal ? 1 : 2));
      expect(put.callCount).to.equal(2);
    } else if (results.method === api.patch) {
      expect(successCallback1).to.have.been.calledWith(
        results.firstResponse);
      expect(successCallback2).to.have.been.calledWith(
        results.secondResponse);
      expect(get.callCount).to.equal(results.expectedNumberOfHttpGetRequests -
         (results.noLinksForSecondTraversal ? 1 : 2));
      expect(patch.callCount).to.equal(2);
    } else if (results.method === api.delete) {
      expect(successCallback1).to.have.been.calledWith(
        results.firstResponse);
      expect(successCallback2).to.have.been.calledWith(
        results.secondResponse);
      expect(get.callCount).to.equal(results.expectedNumberOfHttpGetRequests -
         (results.noLinksForSecondTraversal ? 1 : 2));
      expect(del.callCount).to.equal(2);
    } else {
      throw new Error('Unknown method: ' + results.method.name + ': ' +
          results.method);
    }
  }

});
