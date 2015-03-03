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

describe('traverson-angular', function() {

  var rootUri = 'http://api.example.org';
  var api = traversonAngular.from(rootUri).json();
  var get;
  var successCallback;
  var errorCallback;

  var result = mockResponse({ foo: 'bar' });

  beforeEach(function() {
    get = sinon.stub();
    api.walker.request = { get: get };
    successCallback = sinon.spy();
    errorCallback = sinon.spy();
  });

  describe('using Traverson\'s basic features', function() {
    var rootStep = {
      uri: rootUri
    };
    var rootResponse = mockResponse({
      irrelevant: { stuff: 'to be ignored' },
      link: rootUri + '/link/to/thing',
      more: { stuff: { that: 'we do not care about' } }
    });

    it('should access the root URI', function() {
      api
      .newRequest()
      .follow()
      .getResource()
      .result
      .then(successCallback, errorCallback);
      expect(get).to.have.been.calledWith(rootUri, {}, sinon.match.func);
    });

    it('should call successCallback with the root doc', function(done) {
      get.callsArgWithAsync(2, null, rootResponse);

      api
      .newRequest()
      .follow()
      .getResource()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(rootResponse.doc);
          expect(errorCallback).to.not.have.been.called;
          done();
        }
      );
    });

    it('should call errorCallback with err', function(done) {
      var err = new Error('test error');
      get.callsArgWithAsync(2, err);

      api
      .follow()
      .getResource()
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

    it('should follow a single element path', function(done) {
      get
      .withArgs(rootUri, {}, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      get
      .withArgs(rootUri + '/link/to/thing', {}, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('link')
      .getResource()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(result.doc);
          expect(errorCallback).to.not.have.been.called;
          done();
        }
      );
    });

    it('should follow a single element path as array', function(done) {
      get
      .withArgs(rootUri, {}, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      get
      .withArgs(rootUri + '/link/to/thing', {}, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow(['link'])
      .getResource()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return successCallback.called; },
        function() {
          expect(successCallback).to.have.been.calledWith(result.doc);
          expect(errorCallback).to.not.have.been.called;
          done();
        }
      );
    });

    it('should call errorCallback with err if link is not found',
        function(done) {
      get
      .withArgs(rootUri, {}, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);

      api
      .newRequest()
      .follow('non-existing-link')
      .getResource()
      .result
      .then(successCallback, errorCallback);

      waitFor(
        function() { return errorCallback.called; },
        function() {
          expect(successCallback).to.not.have.been.called;
          assert(errorCallback.calledOnce);
          expect(errorCallback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(errorCallback.args[0][0].message).to.contain('Could not ' +
           'find property non-existing-link');
          done();
        }
      );
    });

    it('should call errorCallback with err inside recursion', function(done) {
      var err = new Error('test error');

      get
      .withArgs(rootUri, {}, sinon.match.func)
      .callsArgWithAsync(2, null,
        mockResponse({ firstLink: rootUri + '/first' }));
      get
      .withArgs(rootUri + '/first', {}, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('firstLink')
      .getResource()
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
});
