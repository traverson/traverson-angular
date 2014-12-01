traverson-angular
=================

AngularJS integration for Traverson, the JS Hypermedia Client
-------------------------------------------------------------

[![Build Status](https://travis-ci.org/basti1302/traverson-angular.png?branch=master)](https://travis-ci.org/basti1302/traverson-angular)
[![Dependency Status](https://david-dm.org/basti1302/traverson-angular.png)](https://david-dm.org/basti1302/traverson-angular)

[![browser support](http://ci.testling.com/basti1302/traverson-angular.png)](http://ci.testling.com/basti1302/traverson-angular)

[![NPM](https://nodei.co/npm/traverson-angular.png?downloads=true&stars=true)](https://nodei.co/npm/traverson-angular/)


Introduction
------------

traverson-angular offers seamless integration of <a href="https://github.com/basti1302/traverson">Traverson</a> with AngularJS. Traverson comes in handy when consuming REST APIs that follow the HATEOAS principle, that is, REST APIs that have links between their resources. If you don't know Traverson, you should probably have a look at its <a href="https://github.com/basti1302/traverson">GitHub page</a> or at this <a href="https://blog.codecentric.de/en/2013/11/traverson/">introductory blog post</a> first.

traverson-angular wraps Traverson in an AngularJS module and converts the original callback based API into an API based on promises.

Installation
------------

### npm

See [below](#using-npm-and-browserify).

### Download

You can grab a download from the [latest release](https://github.com/basti1302/traverson-angular/releases/latest). All downloads include traverson-angular and a bundled Traverson library, so you do not need to include Traverson separately. Here are your options:

* `traverson-angular.min.js`: Minified build with UMD. This build can be used with a script tag or with an AMD loader like RequireJS (untested). It will register the AngularJS module `traverson`, which you can use as a dependency of your module (see below). **If in doubt, use this build.**
* `traverson-angular.js`: Non-minified build with UMD. Same as above, just larger.
* `traverson.external.min.js`: Minified require/external build. Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson-angular`. This build could be used if you use browserify but do not want to bundle traverson-angular and Traverson with your own browserify build but keep it as a separate file.
* `traverson.external.js`: Non-minified require/external build, same as before, just larger.

### Bower

`bower install traverson-angular --save`

Usage
-----

```
angular.module('my-app', ['traverson']);
```

```
angular.module('my-app').service('apiService', function(traverson) {
  ...
});
```

Have a look at the examples in the repository:

* <a href="https://github.com/basti1302/traverson-angular/blob/master/browser/example/index.html">Example 1</a> (<a href="https://github.com/basti1302/traverson-angular/blob/master/browser/example/traverson-angular-example.js">JavaScript here</a>)
* <a href="https://github.com/basti1302/traverson-angular/blob/master/browser/example/github.html">GitHub API example</a> (<a href="https://github.com/basti1302/traverson-angular/blob/master/browser/example/github-example.js">JavaScript here</a>)

Using npm and Browserify
------------------------

If you are using npm and [Browserify](http://browserify.org/) and writing your <a href="https://blog.codecentric.de/en/2014/08/angularjs-browserify/">AngularJS app as CommonJS modules</a>, instead of downloading a release, you can install it with `npm install traverson-angular -S`.

This is how your code using traverson-angular would look like:
```
var angular = require('angular');
var traverson = require('traverson-angular');
var app = angular.module('my-app', [traverson.name]);

...

app.service('apiService', function(traverson) {
  ...
});

```

See <a href="https://github.com/basti1302/traverson-angular/tree/master/browser/example/browserify">here</a> for a complete, working example of a CommonJS based AngularJS app using traverson-angular, build with Browserify.

To `require` angular-core like this, you need a shim in your package.json, like this:

```
{
  ...
  "dependencies": {
    "angular": "^1.3.4",
    ...
  },
  "browser": {
    "angular": "./angular/angular-common-js.js"
  }
}

```

`angular-common-js.js:`
```
require('./angular.js');
module.exports = angular;
```

Browserify your app as usual - Browserify will include traverson-angular, Traverson itself and its dependencies for you.

API
---

You should refer to <a href="https://github.com/basti1302/traverson/blob/master/readme.markdown">Traverson's docs</a> for general info how to work with Traverson. Anything that works with Taverson also works with traverson-angular. The only difference is that traverson-angular's methods are not callback-based but work with promises.

So this code, which uses Traverson directly:
```
var api = traverson.json.from('http://api.io')

api.newRequest()
.follow('link_to', 'resource')
.getResource(function(error, document) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path and reached our destination.')
    console.log(JSON.stringify(document))
  }
});
```
becomes this with traverson-angular:
```
var api = traverson.json.from('http://api.io')

api.newRequest()
.follow('link_to', 'resource')
.getResource().then(function(document) {
  console.log('We have followed the path and reached our destination.')
  console.log(JSON.stringify(document))
}, function(err) {
  console.error('No luck');
});
```

The only difference is `.getResource(function(error, document) {` => `.getResource().then(function(document) {`.

The following methods return promises:

* `get`
* `getResource`
* `getUri`
* `post`
* `put`
* `patch`
* `del`

Release Notes
-------------

* 0.13.0 2014-12-01
   * Reduce size of browser build by 33%. The minified version now has 37k instead of 55k (still too much, but also much better than before)
* 0.12.0 2014-11-29:
    * Initial release

License
-------

MIT

