/* global angular */
'use strict';

var chai = require('chai')
  , expect = chai.expect;

describe('traverson-angular using angular-mocks', function () {

  var rootUri = 'http://api.example.org';
  var httpBackend, traverson;

  beforeEach(angular.mock.module('traverson'));

  beforeEach(angular.mock.inject(function (_$httpBackend_, _traverson_) {
    traverson = _traverson_;

    httpBackend = _$httpBackend_;
    httpBackend.whenGET(rootUri).respond(JSON.stringify({
      stuff: 'a value',
      link: rootUri + '/link/to/thing'
    }));
    httpBackend.whenGET(rootUri + '/link/to/thing').respond(JSON.stringify({
      foo: 'bar'
    }));
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should access the root URI', function (done) {
    traverson
      .from(rootUri)
      .useAngularHttp()
      .json()
      .newRequest()
      .follow()
      .getResource()
      .result
      .then(function (response) {
        expect(response.stuff).to.equal('a value');
        done();
      }, function (error) {
        done(error);
      });

    httpBackend.flush();
  });

  it('should access the link', function (done) {
    traverson
      .from(rootUri)
      .useAngularHttp()
      .json()
      .newRequest()
      .follow('link')
      .getResource()
      .result
      .then(function (response) {
        expect(response.foo).to.equal('bar');
        done();
      }, function (error) {
        done(error);
      });

    httpBackend.flush();
  });
});
