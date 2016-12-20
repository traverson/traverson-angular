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
var Builder = traverson._Builder;
var originalMethods = {
  get: Builder.prototype.get,
  getResource: Builder.prototype.getResource,
  getUrl: Builder.prototype.getUrl,
  post: Builder.prototype.post,
  put: Builder.prototype.put,
  patch: Builder.prototype.patch,
  delete: Builder.prototype.delete,
};

traversonAngular.factory('traverson',
  ['$q', '$httpTraversonAdapter',
    function traversonFactory($q, $httpTraversonAdapter) {

  function promisify(that, originalMethod, argsArray) {
    var deferred = $q.defer();

    argsArray = argsArray || [];

    var traversal;
    var callback = function(err, result, _traversal) {
      if (err) {
        err.result = result;
        deferred.reject(err);
      } else {
        traversal = _traversal;
        deferred.resolve(result);
      }
    };

    argsArray.push(callback);

    var traversalHandler = originalMethod.apply(that, argsArray);

    function continueTraversal() {
      var deferredContinue = $q.defer();
      deferred.promise.then(function() {
        deferredContinue.resolve(traversal.continue());
      }, function() {
        var error = new Error('Can\'t continue from a broken traversal.');
        error.name = 'InvalidStateError';
        throw error;
      });
      return deferredContinue.promise;
    }

    return {
       result: deferred.promise,
       continue: continueTraversal,
       abort: traversalHandler.abort,
       then: function() {
         throw new Error('As of version 2.0.0, Traverson\'s action methods ' +
           'do no longer return the promise directly. Code like \n' +
           'traverson.from(url).follow(...).getResource().then(...)\n' +
           'needs to be changed to \n' +
           'traverson.from(url).follow(...).getResource().result.then(...)');
       },
    };
  }

  Builder.prototype.get = function() {
    return promisify(this, originalMethods.get);
  };

  Builder.prototype.getResource = function() {
    return promisify(this, originalMethods.getResource);
  };

  Builder.prototype.getUrl = Builder.prototype.getUri = function() {
    return promisify(this, originalMethods.getUrl);
  };

  Builder.prototype.post = function(body) {
    return promisify(this, originalMethods.post, [body]);
  };

  Builder.prototype.put = function(body) {
    return promisify(this, originalMethods.put, [body]);
  };

  Builder.prototype.patch = function(body) {
    return promisify(this, originalMethods.patch, [body]);
  };

  Builder.prototype.delete = Builder.prototype.del = function() {
    return promisify(this, originalMethods.delete);
  };

  Builder.prototype.useAngularHttp = function() {
    this.withRequestLibrary($httpTraversonAdapter);
    return this;
  };

  return traverson;
}]);

traversonAngular.factory('$httpTraversonAdapter', [
  '$http', '$q', function $httpTraversonAdapterFactory($http, $q) {

    function Request() { }

    Request.prototype.get = function(uri, options, callback) {
      options = mapOptions(options);
      $http
      .get(uri, options)
      .then(handleResponse(callback))
      .catch(handleError(callback));
      return new AbortHandle(options.timeout);
    };

    Request.prototype.post = function(uri, options, callback) {
      options = mapOptions(options);
      $http
      .post(uri, options.data, options)
      .then(handleResponse(callback))
      .catch(handleError(callback));
      return new AbortHandle(options.timeout);
    };

    Request.prototype.put = function(uri, options, callback) {
      options = mapOptions(options);
      $http
      .put(uri, options.data, options)
      .then(handleResponse(callback))
      .catch(handleError(callback));
      return new AbortHandle(options.timeout);
    };

    Request.prototype.patch = function(uri, options, callback) {
      options = mapOptions(options);
      $http
      .patch(uri, options.data, options)
      .then(handleResponse(callback))
      .catch(handleError(callback));
      return new AbortHandle(options.timeout);
    };

    Request.prototype.del = function(uri, options, callback) {
      options = mapOptions(options);
      $http
      .delete(uri, options)
      .then(handleResponse(callback))
      .catch(handleError(callback));
      return new AbortHandle(options.timeout);
    };

    function mapOptions(options) {
      options = options || {};
      var mappedOptions = {};
      mapQuery(mappedOptions, options);
      mapHeaders(mappedOptions, options);
      mapAuth(mappedOptions, options);
      mapBody(mappedOptions, options);
      mapForm(mappedOptions, options);
      // do not parse JSON automatically, this will trip up Traverson
      mappedOptions.transformResponse = function(data, headersGetter, status) {
        return data;
      };
      // hook to abort the request, if necessary
      mappedOptions.timeout = $q.defer();
      return mappedOptions;
    }

    function mapQuery(mappedOptions, options) {
      // options.qs would be correct since we are using request/request options
      // object API, but a previous version of traverson-angular incorrectly
      // used options.query instead, so we allow this also, to not break
      // backwards compatibility.
      var qs =  options.qs || options.query;
      if (qs) {
        mappedOptions.params = qs;
      }
    }

    function mapHeaders(mappedOptions, options) {
      if (options.headers) {
        mappedOptions.headers = options.headers;
      }
    }

    function mapAuth(mappedOptions, options) {
      var auth = options.auth;
      if (auth) {
        var username = auth.user || auth.username;
        var password = auth.pass || auth.password;
        mappedOptions.headers = mappedOptions.headers || {};
        mappedOptions.headers.Authorization = 'Basic ' + btoa(username + ':' +
          password);
      }
    }

    function mapBody(mappedOptions, options) {
      if (options.body) {
        mappedOptions.data = options.body;
      }
    }

    function mapForm(mappedOptions, options) {
      var form = options.form;
      if (form) {
        mappedOptions.data = form;
        mappedOptions.headers = mappedOptions.headers || {};
        mappedOptions.headers['Content-Type'] =
          'application/x-www-form-urlencoded';
      }
    }

    function mapResponse(response) {
      response.body = response.data;
      response.headers = response.headers();
      response.statusCode = response.status;
      return response;
    }

    function handleResponse(callback) {
      return function(response) {
        return callback(null, mapResponse(response));
      };
    }

    function handleError(callback) {
      return function(response) {
        if (response.status >= 100 && response.status < 600) {
          // This happens on a completed HTTP request with a status code outside
          // of the 2xx range. In the context of Traverson, this is not an
          // error, in particular, if this is the last request in a traversal.
          // Thus, we re-route it to the successCallback. Handling 4xx and 5xx
          // errors during the traversal is the responsibility of traverson, not
          // traverson-angular.
           return callback(null, mapResponse(response));
        } else {
           // This happens on network errors, timeouts etc. In this case,
           // AngularJS sets the status property to 0. In the context of
           // Traverson, only these are to be interpreted as errors.
           return callback(response);
        }
      };
    }

    return new Request();
  }
]);

function AbortHandle(abortPromise) {
  this.abortPromise = abortPromise;
  this.listeners = [];
}

AbortHandle.prototype.abort = function() {
  this.abortPromise.resolve();
  this.listeners.forEach(function(fn) {
    fn.call();
  });
};

AbortHandle.prototype.on = function(event, fn) {
  if (event !== 'abort') {
    var error = new Error('Event ' + event + ' not supported');
    error.name = 'InvalidArgumentError';
    throw error;
  }
  this.listeners.push(fn);
};

module.exports = traversonAngular;
