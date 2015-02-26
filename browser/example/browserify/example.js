'use strict';

var angular = require('angular');
require('angular-sanitize');

var traverson = require('traverson-angular');

var app = angular
    .module('traverson-angular-browserify-example',
    [traverson.name, 'ngSanitize']);

var rootUri = '/';

app.controller('generalSetup', function($scope) {
  $scope.code =
    'var rootUri = \'' + rootUri + '\';<br>' +
    'var api = traverson.from(rootUri);<br><br>' +

    '// Requiring and registering the traverson-hal plug-in is fully ' +
    'optional,<br>' +
    '// you only need that when you want HAL support.<br>' +
    'var JsonHalAdapter = require(\'traverson-hal\');<br>' +
    'traverson.registerMediaType(JsonHalAdapter.mediaType, ' +
    'JsonHalAdapter);<br>';
});

app.service('apiService', function(traverson) {

  var api = traverson.from(rootUri);

  // Requiring and registering the traverson-hal plug-in is fully optional,
  // you only need that when you want HAL support.
  var JsonHalAdapter = require('traverson-hal');
  traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

  this.plainVanilla = function() {
    return api
    .json()
    .withRequestOptions({ headers: { 'accept': 'application/json' } })
    .follow('second', 'doc')
    .getResource();
  };

  this.jsonPath = function() {
    return api
    .json()
    .withRequestOptions({ headers: { 'accept': 'application/json' } })
    .follow('$.jsonpath.nested.key')
    .getResource();
  };

  this.uriTemplate = function() {
    return api
    .json()
    .withRequestOptions({ headers: { 'accept': 'application/json' } })
    .follow('uri_template')
    .withTemplateParameters({ param: 'foobar', id: 13 })
    .getResource();
  };

  this.jsonHal = function() {
    return api
    .jsonHal()
    .withRequestOptions({ headers: { 'accept': 'application/hal+json' } })
    .follow('first', 'second', 'inside_second')
    .getResource();
  };
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
    '.json()<br>' +
    '.withRequestOptions({<br>' +
    '  headers: { \'accept\': \'application/json\' }<br>' +
    '})<br>' +
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
    '.json()<br>' +
    '.withRequestOptions({<br>' +
    '  headers: { \'accept\': \'application/json\' }<br>' +
    '})<br>' +
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
    '.json()<br>' +
    '.withRequestOptions({<br>' +
    '  headers: { \'accept\': \'application/json\' }<br>' +
    '})<br>' +
    '.follow(\'uri_template\')<br>' +
    '.withTemplateParameters({param: \'foobar\', id: 13})<br>' +
    '.getResource()<br>' +
    '.then(function(resource) {<br>' +
    '  // do something with the resource...<br>' +
    '});';
});

app.controller('jsonHalController', function($scope, apiService) {
  $scope.start = function() {
    $scope.response = '... talking to server, please stand by ...';
    // traverson-hal needs to be registered, see above.
    apiService.jsonHal().then(function(resource) {
       $scope.response = JSON.stringify(resource, null, 2);
    }, function(err) {
       $scope.response = err.message || JSON.stringify(err);
    });
  };

  $scope.code =
    '// traverson-hal needs to be registered, see above.<br>' +
    'api<br>' +
    '.jsonHal()<br>' +
    '.withRequestOptions({<br>' +
    '  headers: { \'accept\': \'application/hal+json\' }<br>' +
    '})<br>' +
    '.follow(\'first\', \'second\', \'inside_second\')<br>' +
    '.getResource()<br>' +
    '.then(function(resource) {<br>' +
    '  // do something with the resource...<br>' +
    '});<br>';
});
