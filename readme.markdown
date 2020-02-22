traverson-angular
=================

AngularJS integration for Traverson, the JS Hypermedia Client
-------------------------------------------------------------

[![Build Status](https://img.shields.io/travis/com/traverson/traverson-angular.svg?branch=master)](https://travis-ci.com/traverson/traverson-angular)
[![Dependency Status](https://david-dm.org/traverson/traverson-angular.png)](https://david-dm.org/traverson/traverson-angular)
[![NPM](https://nodei.co/npm/traverson-angular.png?downloads=true&stars=true)](https://nodei.co/npm/traverson-angular/)
[![Greenkeeper badge](https://badges.greenkeeper.io/traverson/traverson-angular.svg)](https://greenkeeper.io/)

| File Size (browser build) | KB |
|---------------------------|---:|
| minified & gzipped        | 19 |
| minified                  | 66 |

Introduction
------------

traverson-angular offers seamless integration of [Traverson](https://github.com/traverson/traverson) with AngularJS. Traverson comes in handy when consuming REST APIs that follow the HATEOAS principle, that is, REST APIs that have links between their resources. If you don't know Traverson, you should probably have a look at its [GitHub page](https://github.com/traverson/traverson) or at this [introductory blog post](https://blog.codecentric.de/en/2013/11/traverson/) first.

traverson-angular wraps Traverson in an AngularJS module and converts the original callback based API into an API based on promises.

Installation
------------

### npm

See [below](#using-npm-and-browserify).

### Download

You can grab a download from the [latest release](https://github.com/traverson/traverson-angular/releases/latest). All downloads include traverson-angular and a bundled Traverson library, so you do not need to include Traverson separately. Here are your options:

* `traverson-angular.min.js`: Minified build with UMD. This build can be used with a script tag or with an AMD loader like RequireJS (untested). It will register the AngularJS module `traverson`, which you can use as a dependency of your module (see below). **If in doubt, use this build.**
* `traverson-angular.js`: Non-minified build with UMD. Same as above, just larger.
* `traverson.external.min.js`: Minified require/external build. Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson-angular`. This build could be used if you use browserify but do not want to bundle traverson-angular and Traverson with your own browserify build but keep it as a separate file.
* `traverson.external.js`: Non-minified require/external build, same as before, just larger.

### Bower

`bower install traverson-angular --save`

Usage
-----

```javascript
angular.module('my-app', ['traverson']);
```

```javascript
angular.module('my-app').service('apiService', function(traverson) {
  ...
});
```

Have a look at the examples in the repository:

* [Example 1](https://github.com/traverson/traverson-angular/blob/master/browser/example/index.html) ([JavaScript here](https://github.com/traverson/traverson-angular/blob/master/browser/example/traverson-angular-example.js))
* [GitHub API example](https://github.com/traverson/traverson-angular/blob/master/browser/example/github.html) ([JavaScript here](https://github.com/traverson/traverson-angular/blob/master/browser/example/github-example.js))

Using npm and Browserify
------------------------

If you are using npm and [Browserify](http://browserify.org/) and writing your [AngularJS app as CommonJS modules](https://blog.codecentric.de/en/2014/08/angularjs-browserify/), instead of downloading a release, you can install it with `npm install traverson-angular -S`.

This is how your code using traverson-angular would look like:
```javascript
var angular = require('angular');
var traverson = require('traverson-angular');
var app = angular.module('my-app', [traverson.name]);

...

app.service('apiService', function(traverson) {
  ...
});

```

See [here](https://github.com/traverson/traverson-angular/tree/master/browser/example/browserify) for a complete, working example of a CommonJS based AngularJS app using traverson-angular, build with Browserify.

To `require` angular-core like this, you need a shim in your package.json, like this:

```javascript
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
```javascript
require('./angular.js');
module.exports = angular;
```

Browserify your app as usual - Browserify will include traverson-angular, Traverson itself and its dependencies for you.

API
---

You should refer to [Traverson's docs](https://github.com/traverson/traverson/blob/master/readme.markdown) for general info how to work with Traverson. Anything that works with Taverson also works with traverson-angular. The only difference is that traverson-angular's methods are not callback-based but work with promises.

So this code, which uses Traverson directly:
<pre lang="javascript">
traverson
.from('http://api.example.com')
.newRequest()
.follow('link_to', 'resource')
<b>.getResource(function(error, document) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path and reached our destination.')
    console.log(JSON.stringify(document))
  }
});</b>
</pre>
becomes this with traverson-angular:
<pre lang="javascript">
traverson
.from('http://api.example.com')
.newRequest()
.follow('link_to', 'resource')
<b>.getResource()
.result
.then(function(document) {
  console.log('We have followed the path and reached our destination.')
  console.log(JSON.stringify(document))
}, function(err) {
  console.error('No luck');
});</b>
</pre>

The only difference is `.getResource(function(error, document) {` => `.getResource().result.then(function(document) {`.

Actually, the object returned by `getResource` has three properties:
* `result`: the promise representing the link traversal,
* `continue`: a function that can be used to [continue](#continuing-a-link-traversal) a finished link traversal and
* `abort`: a function that can be used to [abort](#aborting-the-link-traversal) link traversal that is in progress.

The following action methods of the Traverson request builder return such an object (`{ result, continue, abort }`) when used via traverson-angular:

* `get()`
* `getResource()`
* `getUri()`
* `post(payload)`
* `put(payload)`
* `patch(payload)`
* `delete`

### How HTTP Status Code Are Handled

In contrast to AngularJS' `$http` service, Traverson and traverson-angular do not interpret status codes outside of the 2xx range as an error condition. Only network problems (host not reachable, timeouts, etc.) lead to a rejection of the promise, that is, only those trigger the error callback. Completed HTTP requests, even those with status 4xx or 5xx are interpreted as a success and trigger the success callback. This applies only to the last request in a traversal, HTTP requests *during* the traversal that respond with 4xx/5xx are interpreted as an error (because the traversal can not continue).

This also holds when using `.useAngularHttp()` (see below).

### Using AngularJS' $http Service Instead Of Traverson's HTTP Module

Traverson has it's own HTTP module (based on [superagent](https://github.com/visionmedia/superagent)) and by default, this is used to make HTTP requests. If you want to use Traverson in a project that makes use of AngularJS' $http service and its configuration possibilities (default headers, interceptors and so on), these configurations do not apply automatically to the requests issued by Traverson. If you want that, you can configure traverson-angular to use $http instead of Traverson's HTTP module by calling `useAngularHttp()` on the request builder.

Example:

<pre lang="javascript">
traverson
.from('http://api.example.com')
<b>.useAngularHttp()</b>
.newRequest()
.follow('link_to', 'resource')
.getResource()
.result
.then(function(document) {
  ...
});
</pre>

### Continuing a Link Traversal

See [Traverson's README](https://github.com/traverson/traverson#continuing-a-link-traversal) for a general description of the `continue()` feature. This section just describes how to use it with traverson-angular.

The object returned by the action methods (`get`, `getResource`, `getUrl`, `post`, `put`, `patch`, `delete`) have a property `continue` which is a function that can be used to obtain a promise that is resolved when the link traversal finishes (as does the `result` promise) and which gives you a request builder instance that starts at the last URL/resource of the finished link traversal. It can be used just as the standard [request builder](https://github.com/traverson/traverson/blob/master/api.markdown#request-builder). That is, it has the same configuration and action methods. It enables you to continue the link traversal from the last target resource and follow more links from there.

So while with plain vanilla Traverson (not traverson-angular) you would continue a successful link traversal process like this:

```javascript
traverson
.from(rootUrl)
.follow('link1', 'link2')
.getResource(function(err, firstResource, traversal) {
  if (err) { return done(err); }
  // do something with the first resource, maybe decide where to go from here.
  traversal
  .continue()
  .follow('link3', 'link3')
  .getResource(function(err, secondResource) {
    if (err) { return done(err); }
    // do something with the second resource
  });
});
```

...this is how it is done with traverson-angular:

<pre lang="javascript">
var request =
traverson
.from('http://api.example.com')
.follow('link1', 'link2');
.getResource();

request.result.then(successCallback, errorCallback);

request.continue().then(function(request) {
  request
  .follow('link3', 'link4');
  .getResource()
  .result
  .then(successCallback2, errorCallback2);
});
</pre>

### Aborting the Link Traversal

As mentioned above, the object returned by the action methods returns an object which also has an `abort()` function.

So while with plain vanilla Traverson (not traverson-angular) you would abort a link traversal process like this

<pre lang="javascript">
var handle =
traverson
.from('http://api.example.com')
.newRequest()
.follow('link_to', 'resource')
.getResource(...);

// abort the link traversal
<b>handle.abort();</b>
</pre>

...this is how it is done with traverson-angular:

<pre lang="javascript">
var handle =
traverson
.from('http://api.example.com')
.newRequest()
.follow('link_to', 'resource')
.getResource();

// register callbacks
handle.result.then(successCallback, errorCallback);

// abort the link traversal
<b>handle.abort()</b>
</pre>

traverson-angular With Media Type Plug-Ins
------------------------------------------

You can use all media type plug-ins that are available for Traverson with traverson-angular. Here is how:

* Make sure the JavaScript for the media type plug-in has been loaded (for example, add a script tag for traverson-hal.min.js).
* Register the media type with a line like this: `traverson.registerMediaType(TraversonJsonHalAdapter.mediaType, TraversonJsonHalAdapter);`.
* If necessary force Traverson to use the media type in question with `setMediaType(...)` (for HAL, you can use the convenience method `.jsonHal()` instead).
* If necessary, add Accept headers so your server knows you want to receive a particular media type. Example: `.withRequestOptions({ headers: { 'accept': 'application/hal+json' } })`.

Here is a snippet outlining how to use traverson-angular with [traverson-hal](https://github.com/traverson/traverson-hal):

```html
<script src="traverson-angular.min.js"></script>
<script src="traverson-hal.min.js"></script>
```

```javascript
traverson.registerMediaType(TraversonJsonHalAdapter.mediaType,
                            TraversonJsonHalAdapter);
traverson
.from(rootUri)
.jsonHal()
.withRequestOptions({ headers: { 'accept': 'application/hal+json' } })
.follow(...)
.getResource()
.result
.then(...);
```

You can find a complete working example for integrating traverson-hal with traverson-anglar in [browser/example/hal.html](https://github.com/traverson/traverson-angular/blob/master/browser/example/hal.html) and [browser/example/hal.js](https://github.com/traverson/traverson-angular/blob/master/browser/example/hal.js).


Contributing
------------

See [Contributing to traverson-angular](https://github.com/traverson/traverson-angular/blob/master/CONTRIBUTING.md).


Code of Conduct
---------------

See [Code of Conduct](https://github.com/traverson/traverson-angular/blob/master/CODE_OF_CONDUCT.md).


Release Notes
-------------

See [CHANGELOG](https://github.com/traverson/traverson-angular/blob/master/CHANGELOG.md).


License
-------

MIT
