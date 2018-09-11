'use strict';

var waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , traversonAngular = require('./angular_test_helper')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('traverson-angular (when tested against a local server)', function() {

  var api;
  var testServer;
  var rootUri = 'http://127.0.0.1:2808/';
  var successCallback;
  var errorCallback;

  beforeEach(function() {
    api = traversonAngular
    .from(rootUri)
    .json()
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    successCallback = sinon.spy();
    errorCallback = sinon.spy();
  });

  it('should fetch the root response', function(done) {
    api
    .newRequest()
    .get()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.first).to.exist;
        expect(resultDoc.first).to.equal(rootUri + 'first');
        done();
      }
    );
  });

  it('should fetch the root document', function(done) {
    api
    .newRequest()
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.first).to.exist;
        expect(resultDoc.first).to.equal(rootUri + 'first');
        done();
      }
    );
  });

  it('should follow a single element path', function(done) {
    api
    .newRequest()
    .follow('first')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.first).to.exist;
        expect(resultDoc.first).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path', function(done) {
    api
    .newRequest()
    .follow('second', 'doc')
    .get()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path (/w AngularJS\' $http)',
      function(done) {
    api
    .newRequest()
    .useAngularHttp()
    .follow('second', 'doc')
    .get()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path to a resource', function(done) {
    api
    .newRequest()
    .follow('second', 'doc')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path to a resource (/w AngularJS\' $http)',
      function(done) {
    api
    .newRequest()
    .useAngularHttp()
    .follow('second', 'doc')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should authenticate', function(done) {
    api
    .newRequest()
    .withRequestOptions({
      auth: {
        user: 'traverson',
        pass: 'verysecretpassword',
        sendImmediately: false
      }
    })
    .follow('auth')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.user).to.exist;
        expect(resultDoc.user).to.equal('authenticated');
        done();
      }
    );
  });

  it('should authenticate (/w AngularJS\' $http)', function(done) {
    api
    .newRequest()
    .useAngularHttp()
    .withRequestOptions({
      auth: {
        user: 'traverson',
        pass: 'verysecretpassword',
        sendImmediately: false
      }
    })
    .follow('auth')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.user).to.exist;
        expect(resultDoc.user).to.equal('authenticated');
        done();
      }
    );
  });

  it('should leverage JSONPath', function(done) {
    api
    .newRequest()
    .follow('$.jsonpath.nested.key')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.third).to.exist;
        expect(resultDoc.third).to.equal('document');
        done();
      }
    );
  });

  it('should leverage URI templates', function(done) {
    api
    .newRequest()
    .withTemplateParameters({param: 'foobar', id: 13})
    .follow('uri_template')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.some).to.equal('document');
        expect(resultDoc.param).to.equal('foobar');
        expect(resultDoc.id).to.equal('13');
        done();
      }
    );
  });

  it('should follow the location header', function(done) {
    api
    .newRequest()
    .follow('respond_location')
    .followLocationHeader()
    .follow('doc')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc).to.eql({ second: 'document' });
        done();
      }
    );
  });

  // this is a 404 *during* the traversal, which is interpreted as an error
  // condition
  it('should fail gracefully on 404 during traversal (get())', function(done) {
    api
    .newRequest()
    .follow('blind_alley', 'more', 'links')
    .get()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return errorCallback.called; },
      function() {
        expect(successCallback.callCount).to.equal(0);
        expect(errorCallback.callCount).to.equal(1);
        var error = errorCallback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.name).to.equal('HTTPError');
        expect(error.message).to.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.');
        expect(error.url).to.equal(rootUri + 'does/not/exist');
        expect(error.httpStatus).to.equal(404);

        var lastBody = error.body;
        expect(lastBody).to.exist;
        expect(lastBody).to.contain('message');
        expect(lastBody).to.contain('resource not found');
        done();
      }
    );
  });

  // same as above (that is, a 404 *during* the traversal, which is interpreted
  // as an error condition), this time using AngularJS' $http service
  it('should fail gracefully on 404 during traversal ' +
     '(get(), /w AngularJS\' $http)', function(done) {
    api
    .newRequest()
    .useAngularHttp()
    .follow('blind_alley', 'more', 'links')
    .get()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return errorCallback.called; },
      function() {
        expect(successCallback.callCount).to.equal(0);
        expect(errorCallback.callCount).to.equal(1);
        var error = errorCallback.firstCall.args[0];

        expect(error).to.exist;
        expect(error.name).to.equal('HTTPError');
        expect(error.message).to.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.');
        expect(error.url).to.equal(rootUri + 'does/not/exist');
        expect(error.httpStatus).to.equal(404);

        var lastBody = error.body;
        expect(lastBody).to.exist;
        expect(lastBody).to.contain('message');
        expect(lastBody).to.contain('resource not found');
        done();
      }
    );
  });

  // this is a 404 *at the end* of the traversal, which is *not* interpreted as
  // an error condition
  it('should just deliver the last response of get(), even when the last ' +
      'response is a 404',
      function(done) {
    api
    .newRequest()
    .follow('blind_alley')
    .get()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody(404);
        expect(resultDoc).to.exist;
        expect(resultDoc.message).to.exist;
        expect(resultDoc.message).to.equal('resource not found');
        done();
      }
    );
  });

  // same as above, that is, a 404 *at the end* of the traversal, which is
  // *not* interpreted as an error condition, this time using AngularJS' $http
  // service
  it('should just deliver the last response of get(), even when the last ' +
      'response is a 404 (/w AngularJS\' $http)',
      function(done) {
    api
    .newRequest()
    .useAngularHttp()
    .follow('blind_alley')
    .get()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody(404);
        expect(resultDoc).to.exist;
        expect(resultDoc.message).to.exist;
        expect(resultDoc.message).to.equal('resource not found');
        done();
      }
    );
  });

  /*
  it('https://github.com/traverson/traverson-angular/issues/14',
      function(done) {
    traversonAngular
    .from(rootUri)
    .useAngularHttp()
    .follow()
    .post({})
    .result
    .then(successCallback, errorCallback);

    waitFor(
      function() { return successCallback.called || errorCallback.called; },
      function() {
        console.log('successCallback.called', successCallback.called);
        console.log('errorCallback.called', errorCallback.called);
        done();
      }
    );
  });
  */

  // again, 404 during traversal => error, this time with getResouce()
  it('should fail gracefully on 404 during traversal (getResource())',
      function(done) {
    api
    .newRequest()
    .follow('blind_alley')
    .getResource().result.then(successCallback, errorCallback);
    waitFor(
      function() { return errorCallback.called; },
      function() {
        expect(successCallback.callCount).to.equal(0);
        expect(errorCallback.callCount).to.equal(1);
        var error = errorCallback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.name).to.equal('HTTPError');
        expect(error.message).to.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.');
        expect(error.url).to.equal(rootUri + 'does/not/exist');
        expect(error.httpStatus).to.equal(404);

        var lastBody = error.body;
        expect(lastBody).to.exist;
        expect(lastBody).to.contain('message');
        expect(lastBody).to.contain('resource not found');
        done();
      }
    );
  });

  it('should fail gracefully on syntactically incorrect JSON',
      function(done) {
    traversonAngular
    .from(rootUri)
    .json()
    .follow('garbage')
    .getResource().result.then(successCallback, errorCallback);
    waitFor(
      function() { return errorCallback.called; },
      function() {
        expect(successCallback.callCount).to.equal(0);
        expect(errorCallback.callCount).to.equal(1);
        var error = errorCallback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.name).to.equal('JSONError');
        expect(error.message).to.equal('The document at ' + rootUri + 'junk' +
          ' could not be parsed as JSON: { this will :: not parse');
        expect(error.url).to.equal(rootUri + 'junk');
        expect(error.body).to.equal('{ this will :: not parse');
        done();
      }
    );
  });

  it('should abort a link traversal process and the current request',
      function(done) {
    var handle =
    api
    .newRequest()
    .follow('second', 'doc')
    .getResource();

    handle.result.then(successCallback, errorCallback);
    handle.abort();
    waitFor(
      function() { return errorCallback.called; },
      function() {
        expect(successCallback.callCount).to.equal(0);
        expect(errorCallback.callCount).to.equal(1);
        var error = errorCallback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.message).to.equal(
           'Link traversal process has been aborted.');
        done();
      }
    );
  });

  it('should abort a post request',
      function(done) {
    var handle =
    api
    .newRequest()
    .post({});

    handle.result.then(successCallback, errorCallback);
    handle.abort();
    waitFor(
      function() { return errorCallback.called; },
      function() {
        expect(successCallback.callCount).to.equal(0);
        expect(errorCallback.callCount).to.equal(1);
        var error = errorCallback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.message).to.equal(
           'Link traversal process has been aborted.');
        done();
      }
    );
  });

  it('should yield the last URI', function(done) {
    api
    .newRequest()
    .follow('second', 'doc')
    .getUrl()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        expect(successCallback.callCount).to.equal(1);
        expect(errorCallback.callCount).to.equal(0);
        var result = successCallback.firstCall.args[0];
        expect(result).to.exist;
        expect(result).to.equal(rootUri + 'second/document');
        done();
      }
    );
  });

  it('should post', function(done) {
    var payload = {'new': 'document'};
    api
    .newRequest()
    .follow('post_link')
    .post(payload)
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody(201);
        expect(resultDoc.document).to.exist;
        expect(resultDoc.document).to.equal('created');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  it('should put', function(done) {
    var payload = {'updated': 'document'};
    api
    .newRequest()
    .follow('put_link')
    .put(payload)
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.document).to.exist;
        expect(resultDoc.document).to.equal('overwritten');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  // This test will not work via mocha-phantomjs since PhantomJS currently
  // sends an empty body with a PATCH request, see
  // https://github.com/ariya/phantomjs/issues/11384
  it.skip('should patch', function(done) {
    var payload = {'patched': 'document'};
    api
    .newRequest()
    .follow('patch_link')
    .patch(payload)
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.document).to.exist;
        expect(resultDoc.document).to.equal('patched');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  it('should delete', function(done) {
    api
    .newRequest()
    .follow('delete_link')
    .delete()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var response = checkResponse(204);
        done();
      }
    );
  });

  it('should use provided request options', function(done) {
    api
    .newRequest()
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'X-Traverson-Test-Header': 'Traverson rocks!'
      }
    })
    .follow('echo-headers')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        var testResponseHeader =
            resultDoc['X-Traverson-Test-Header'] ||
            resultDoc['x-traverson-test-header'];
        expect(testResponseHeader).to.exist;
        expect(testResponseHeader).to.equal('Traverson rocks!');
        done();
      }
    );
  });

  it('should use provided request options (/w AngularJS\' $http)',
      function(done) {
    var payload = {'updated': 'document'};
    api
    .newRequest()
    .follow('put_link')
    .useAngularHttp()
    .withRequestOptions({
      headers: {
        'Content-Type': 'application/json',
        'If-Match': 'something'
      }
    })
    .put(payload)
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.document).to.exist;
        expect(resultDoc.document).to.equal('overwritten');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        expect(resultDoc.headers).to.exist;
        expect(resultDoc.headers['content-type']).to.equal('application/json');
        expect(resultDoc.headers['if-match']).to.equal('something');
        done();
      }
    );
  });

  it('should use provided query string options', function(done) {
    api
    .newRequest()
    .withRequestOptions({
      qs: {
        'token': 'foobar'
      }
    })
    .follow('echo-query')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.token).to.exist;
        expect(resultDoc.token).to.equal('foobar');
        done();
      }
    );
  });

  it('should add request options on top of each other', function(done) {
    api
    .newRequest()
    .addRequestOptions({
      headers: { 'Accept': 'application/json', }
    })
    .addRequestOptions({
      headers: { 'X-Traverson-Test-Header': 'Traverson rocks!' }
    })
    .addRequestOptions({
      qs: { 'token': 'foobar' }
    })
    .follow('echo-all')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        var responseTestHeader =
            resultDoc.headers['X-Traverson-Test-Header'] ||
            resultDoc.headers['x-traverson-test-header'];
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/json');
        expect(responseTestHeader).to.exist;
        expect(responseTestHeader).to.equal('Traverson rocks!');
        expect(resultDoc.query.token).to.equal('foobar');
        done();
      }
    );
  });

  it(
      'should add request options on top of each other (/w AngularJS\' $http)',
      function(done) {
    api
    .newRequest()
    .useAngularHttp()
    .addRequestOptions({
      headers: { 'Accept': 'application/json', }
    })
    .addRequestOptions({
      headers: { 'X-Traverson-Test-Header': 'Traverson rocks!' }
    })
    .addRequestOptions({
      qs: { 'token': 'foobar' }
    })
    .follow('echo-all')
    .getResource()
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResultDoc();
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        var responseTestHeader =
            resultDoc.headers['X-Traverson-Test-Header'] ||
            resultDoc.headers['x-traverson-test-header'];
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/json');
        expect(responseTestHeader).to.exist;
        expect(responseTestHeader).to.equal('Traverson rocks!');
        expect(resultDoc.query.token).to.equal('foobar');
        done();
      }
    );
  });

  it('should use provided request options with post', function(done) {
    var payload = { what: 'ever' };
    api
    .newRequest()
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Traverson-Test-Header': 'Traverson rocks!'
      },
      qs: { 'token': 'foobar' }
    })
    .follow('echo-all')
    .post(payload)
    .result
    .then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody(201);
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        var responseTestHeader =
            resultDoc.headers['X-Traverson-Test-Header'] ||
            resultDoc.headers['x-traverson-test-header'];
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/json');
        expect(responseTestHeader).to.exist;
        expect(responseTestHeader).to.equal('Traverson rocks!');
        expect(resultDoc.query.token).to.equal('foobar');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  it('should post with x-www-form-urlencoded',
      function(done) {
    var payload = { item: '#4711', quantity: 1 };
    traversonAngular
    .from(rootUri)
    .withRequestOptions([
      { headers: { 'Accept': 'application/json' } },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    ])
    .follow('echo-all')
    .post(payload).result.then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody(201);
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        var responseContentType =
            resultDoc.headers['Content-Type'] ||
            resultDoc.headers['content-type'];
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/json');
        expect(responseContentType).to.exist;
        expect(responseContentType)
          .to.equal('application/x-www-form-urlencoded');
        expect(resultDoc.received).to.exist;
        expect(JSON.stringify(resultDoc.received)).to.contain('item');
        expect(JSON.stringify(resultDoc.received)).to.contain('#4711');
        done();
      }
    );
  });

  it('should post form via request options with x-www-form-urlencoded',
      function(done) {
    var order = { item: '#4711', quantity: '1'};
    traversonAngular
    .from(rootUri)
    .withRequestOptions([
      { headers: { 'Accept': 'application/json' } },
      {
        headers: { 'Accept': 'application/json' },
        form: order,
      }
    ])
    .follow('echo-all')
    .post(null).result.then(successCallback, errorCallback);
    waitFor(
      function() { return successCallback.called; },
      function() {
        var resultDoc = checkResponseWithBody(201);
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        var responseContentType =
            resultDoc.headers['Content-Type'] ||
            resultDoc.headers['content-type'];
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/json');
        expect(responseContentType).to.exist;
        expect(responseContentType)
          .to.equal('application/x-www-form-urlencoded');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(order);
        done();
      }
    );
  });

  function checkResponseWithBody(httpStatus) {
    var response = checkResponse(httpStatus);
    var body = response.body;
    expect(body).to.exist;
    var resultDoc = JSON.parse(body);
    return resultDoc;
  }

  function checkResponse(httpStatus) {
    httpStatus = httpStatus || 200;
    expect(successCallback.callCount).to.equal(1);
    expect(errorCallback.callCount).to.equal(0);
    var response = successCallback.firstCall.args[0];
    expect(response).to.exist;
    expect(response.statusCode).to.exist;
    expect(response.statusCode).to.equal(httpStatus);
    return response;
  }

  function checkResultDoc() {
    expect(successCallback.callCount).to.equal(1);
    expect(errorCallback.callCount).to.equal(0);
    var resultDoc = successCallback.firstCall.args[0];
    expect(resultDoc).to.exist;
    return resultDoc;
  }
});
