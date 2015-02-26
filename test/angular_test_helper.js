/* global angular */
'use strict';

var testModule = angular.module('testModule', ['traverson'])
  , injector = angular.injector(['ng', 'testModule'])
  , traversonAngular = injector.get('traverson')
  ;

module.exports = traversonAngular;
