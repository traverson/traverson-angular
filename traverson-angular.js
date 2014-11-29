/* global angular */
'use strict';

var traverson = require('traverson');

var traversonAngular = angular.module('traverson', []);

traversonAngular.factory('traverson', function traversonFactory($q) {
  var Builder = traverson._Builder;
  var originalMethods = {
    get: Builder.prototype.get,
    getResource: Builder.prototype.getResource,
    getUri: Builder.prototype.getUri,
    post: Builder.prototype.post,
    put: Builder.prototype.put,
    patch: Builder.prototype.patch,
    del: Builder.prototype.del,
  };

  function promisify(that, originalMethod, callback) {
    var deferred = $q.defer();
    originalMethod.call(that, function(err, result, uri) {
      if (err) {
        err.result = result;
        err.uri = uri;
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.promise;
  }

  Builder.prototype.get = function(callback) {
    return promisify(this, originalMethods.get, callback);
  };

  Builder.prototype.getResource = function(callback) {
    return promisify(this, originalMethods.getResource, callback);
  };

  Builder.prototype.getUri = function(callback) {
    return promisify(this, originalMethods.getUri, callback);
  };

  Builder.prototype.post = function(callback) {
    return promisify(this, originalMethods.post, callback);
  };

  Builder.prototype.put = function(callback) {
    return promisify(this, originalMethods.put, callback);
  };

  Builder.prototype.patch = function(callback) {
    return promisify(this, originalMethods.patch, callback);
  };

  Builder.prototype.del = function(callback) {
    return promisify(this, originalMethods.del, callback);
  };

  return traverson;
});

module.exports = traversonAngular;
