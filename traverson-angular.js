/* global angular */
'use strict';

var traverson = require('traverson');

var ng;
if (typeof angular !== 'undefined') {
  // angular is defined globally, use this
  ng = angular;
} else {
  // angular is not defined globally, try to require it
  ng = require('angular');
  if (typeof ng.module !== 'function') {
    throw new Error('angular has either to be provided globally or made ' +
        'available as a shim for browserify. (Also, if the angular module on ' +
        'npm would actually be a proper CommonJS module, this error ' +
        'wouldn\'t be a thing.)');
  }
}

var traversonAngular = ng.module('traverson', []);

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
