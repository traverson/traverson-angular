/* global angular */

(function() {
  'use strict';

  var app =
    angular.module('traverson-angular-example',
    ['traverson', 'ngSanitize']);

  var rootUri = '/';

  app.service('apiService', function(traverson) {

    var api = traverson.from(rootUri).json();

    this.setUseAngularHttp = function(val) {
      if (val) {
        api.useAngularHttp();
      } else {
        api = traverson.from(rootUri).json();
      }
    };

    this.plainVanilla = function() {
      return api
      .follow('second', 'doc')
      .getResource();
    };

    this.jsonPath = function() {
      return api
      .follow('$.jsonpath.nested.key')
      .getResource();
    };

    this.uriTemplate = function() {
      return api
      .follow('uri_template')
      .withTemplateParameters({ param: 'foobar', id: 13 })
      .getResource();
    };

    this.post = function() {
      return api
      .follow('post_link')
      .post({ payload: 'this is the payload' });
    };
  });

  app.controller('main', function($scope) {
    $scope.config = {
      use$http: false,
    };
  });

  app.controller('generalSetup', function($scope, apiService) {
    function code() {
      return 'var rootUri = \'' + rootUri + '\';<br>' +
      'var api = traverson.from(rootUri).json()' +
      ($scope.config.use$http ? '.useAngularHttp()' : '') +
      ';<br>';
    }
    $scope.code = code();
    $scope.$parent.$watch('config.use$http', function(newValue) {
      console.log(newValue);
      apiService.setUseAngularHttp(newValue);
      $scope.code = code();
    });
  });

  app.controller('plainVanillaController', function($scope, apiService) {

    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.plainVanilla().result.then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api<br>' +
      '.follow(\'second\', \'doc\')<br>' +
      '.getResource()<br>' +
      '.result<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('jsonPathController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.jsonPath().result.then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api<br>' +
      '.follow(\'$.jsonpath.nested.key\')<br>' +
      '.getResource()<br>' +
      '.result<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('uriTemplateController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.uriTemplate().result.then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api<br>' +
      '.follow(\'uri_template\')<br>' +
      '.withTemplateParameters({param: \'foobar\', id: 13})<br>' +
      '.getResource()<br>' +
      '.result<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('postController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.post().result.then(function(response) {
         var body = response.body;
         var resource = JSON.parse(body);
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api<br>' +
      '.json()<br>' +
      '.follow(\'post_link\')<br>' +
      '.post({ payload: \'this is the payload\' });<br>' +
      '.result<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

})();
