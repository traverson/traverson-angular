/* global angular */

(function() {
  'use strict';

  var app =
    angular.module('traverson-angular-example',
    ['traverson', 'ngSanitize']);

  var rootUri = '/';

  app.controller('generalSetup', function($scope) {
    $scope.code =
      'var rootUri = \'' + rootUri + '\';<br>' +
      'var api = traverson.from(rootUri).json();<br>';
  });

  app.service('apiService', function(traverson) {

    var api = traverson.from(rootUri).json();

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

    // this.post = function() {
    //   return api
    //   .follow('post_link')
    //   .post({ payload: 'this is the payload' });
    // };
  });

  app.controller('plainVanillaController', function($scope, apiService) {

    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.plainVanilla().then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api<br>' +
      '.follow(\'second\', \'doc\')<br>' +
      '.getResource()<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('jsonPathController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.jsonPath().then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api<br>' +
      '.follow(\'$.jsonpath.nested.key\')<br>' +
      '.getResource()<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('uriTemplateController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.uriTemplate().then(function(resource) {
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
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  // app.controller('postController', function($scope, apiService) {
  //   $scope.start = function() {
  //     $scope.response = '... talking to server, please stand by ...';
  //     apiService.post().then(function(resource) {
  //        $scope.response = JSON.stringify(resource, null, 2);
  //     }, function(err) {
  //        $scope.response = err.message || JSON.stringify(err);
  //     });
  //   };
  //
  //   $scope.code =
  //     'api<br>' +
  //     '.json()<br>' +
  //     '.follow(\'post_link\')<br>' +
  //     '.post({ payload: \'this is the payload\' });<br>' +
  //     '.then(function(resource) {<br>' +
  //     '  // do something with the resource...<br>' +
  //     '});';
  // });

})();
