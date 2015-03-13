/* global angular */

(function() {
  /* global TraversonJsonHalAdapter */
  'use strict';

  var app =
    angular.module('traverson-angular-hal-example',
    ['traverson', 'ngSanitize']);

  var rootUri = '/';

  app.controller('generalSetup', function($scope) {
    $scope.code =
      '// register HAL adapter in Traverson\'s media type registry<br>' +
      'traverson<br>' +
      '.registerMediaType(TraversonJsonHalAdapter.mediaType,' +
      ' TraversonJsonHalAdapter);<br>' +
      '<br>' +
      'var rootUri = \'' + rootUri + '\';<br>' +
      'var api = traverson<br>' +
      '.from(rootUri)<br>' +
      '.jsonHal()<br>' +
      '.withRequestOptions({ headers: { ' +
        '\'accept\': \'application/hal+json\' } });';
  });

  app.service('apiService', function(traverson) {

    // register HAL adapter in Traverson's media type registry
    traverson
    .registerMediaType(TraversonJsonHalAdapter.mediaType,
                       TraversonJsonHalAdapter);

    var api = traverson
    .from(rootUri)
    .jsonHal()
    .withRequestOptions({ headers: { 'accept': 'application/hal+json' } });

    this.hal = function() {
      return api
      .follow('first', 'second', 'inside_second')
      .getResource();
    };

  });

  app.controller('halController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.hal().result.then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api<br>' +
      '.follow(\'first\', \'second\', \'inside_second\')<br>' +
      '.getResource()<br>' +
      '.result<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

})();
