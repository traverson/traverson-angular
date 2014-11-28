/* global angular */
(function() {
  'use strict';

  var app =
    angular.module('traverson-angular-github-example',
    ['traverson', 'ngSanitize']);

  var rootUri = 'https://api.github.com/';

  app.controller('generalSetup', function($scope) {
    $scope.code =
      'var rootUri = \'' + rootUri + '\';<br>' +
      'var api = traverson.json.from(rootUri);<br>'
  });

  app.service('apiService', function(traverson) {
    var api = traverson.json.from(rootUri);
    this.commitComment = function() {
      return api.newRequest()
      .follow('repository_url', 'commits_url', 'comments_url')
      .withTemplateParameters({
        owner: 'basti1302',
        repo: 'traverson',
        sha: '5c82c74583ee67eae727466179dd66c91592dd4a'
      }).getResource();
    };
  });


  app.controller('commitCommentController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to GitHub, please stand by ...';
      apiService.commitComment().then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'api.newRequest()<br>' +
      '.follow(\'repository_url\', \'commits_url\', \'comments_url\')<br>' +
      '.withTemplateParameters({<br>' +
      '&nbsp;&nbsp;owner: \'basti1302\',<br>' +
      '&nbsp;&nbsp;repo: \'traverson\',<br>' +
      '&nbsp;&nbsp;sha: \'5c82c74583ee67eae727466179dd66c91592dd4a\'<br>' +
      ')}.then(function(resource) {<br>' +
      '&nbsp;&nbsp;// do something with the resource...<br>' +
      '});<br>'
  });
})();
