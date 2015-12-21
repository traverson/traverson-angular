traverson-angular
=================

AngularJS integration for Traverson, the JS Hypermedia Client
-------------------------------------------------------------

[![Build Status](https://travis-ci.org/basti1302/traverson-angular.png?branch=master)](https://travis-ci.org/basti1302/traverson-angular)
[![Dependency Status](https://david-dm.org/basti1302/traverson-angular.png)](https://david-dm.org/basti1302/traverson-angular)

[![NPM](https://nodei.co/npm/traverson-angular.png?downloads=true&stars=true)](https://nodei.co/npm/traverson-angular/)

| File Size (browser build) | KB |
|---------------------------|---:|
| minified & gzipped        | 12 |
| minified                  | 38 |

Introduction
------------

traverson-angular offers seamless integration of [Traverson](https://github.com/basti1302/traverson) with AngularJS. Traverson comes in handy when consuming REST APIs that follow the HATEOAS principle, that is, REST APIs that have links between their resources. If you don't know Traverson, you should probably have a look at its [GitHub page](https://github.com/basti1302/traverson) or at this [introductory blog post](https://blog.codecentric.de/en/2013/11/traverson/) first.

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

```javascript
angular.module('my-app', ['traverson']);
```

```javascript
angular.module('my-app').service('apiService', function(traverson) {
  ...
});
```

Have a look at the examples in the repository:

* [Example 1](https://github.com/basti1302/traverson-angular/blob/master/browser/example/index.html) ([JavaScript here](https://github.com/basti1302/traverson-angular/blob/master/browser/example/traverson-angular-example.js))
* [GitHub API example](https://github.com/basti1302/traverson-angular/blob/master/browser/example/github.html) ([JavaScript here](https://github.com/basti1302/traverson-angular/blob/master/browser/example/github-example.js))

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

See [here](https://github.com/basti1302/traverson-angular/tree/master/browser/example/browserify) for a complete, working example of a CommonJS based AngularJS app using traverson-angular, build with Browserify.

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

You should refer to [Traverson's docs](https://github.com/basti1302/traverson/blob/master/readme.markdown) for general info how to work with Traverson. Anything that works with Taverson also works with traverson-angular. The only difference is that traverson-angular's methods are not callback-based but work with promises.

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

See [Traverson's README](https://github.com/basti1302/traverson#continuing-a-link-traversal) for a general description of the `continue()` feature. This section just describes how to use it with traverson-angular.

The object returned by the action methods (`get`, `getResource`, `getUrl`, `post`, `put`, `patch`, `delete`) have a property `continue` which is a function that can be used to obtain a promise that is resolved when the link traversal finishes (as does the `result` promise) and which gives you a request builder instance that starts at the last URL/resource of the finished link traversal. It can be used just as the standard [request builder](https://github.com/basti1302/traverson/blob/master/api.markdown#request-builder). That is, it has the same configuration and action methods. It enables you to continue the link traversal from the last target resource and follow more links from there.

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

Here is a snippet outlining how to use traverson-angular with [traverson-hal](https://github.com/basti1302/traverson-hal):

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

You can find a complete working example for integrating traverson-hal with traverson-anglar in [browser/example/hal.html](https://github.com/basti1302/traverson-angular/blob/master/browser/example/hal.html) and [browser/example/hal.js](https://github.com/basti1302/traverson-angular/blob/master/browser/example/hal.js).

Release Notes
-------------

A new version of traverson-angular is usually released for each new version of Traverson. Since traverson-angular is just a wrapper around Traverson, the release notes will often only just reference the release notes of Traverson. Multiple versions of traverson-angular might be released that use the same version of traverson, so the actual version numbers of traverson and traverson-angular do not always match. The traverson version used in the traverson-angular release is noted for each release.

* 3.1.1 2015-12-21:
    * Update to Traverson release 3.1.1, including an update from JSONPath 0.10 to jsonpath-plus 0.13. (Fixes [#20](https://github.com/basti1302/traverson-angular/issues/20).)
* 3.1.0 2015-11-10:
    * Update to Traverson release 3.1.0 (including `withCredentials`).
* 3.0.0 2015-09-16:
    * Update for Traverson release 3.0.0 (including `followLocationHeader()`).
* 2.1.4 2015-08-27 (using traverson 2.1.0):
    * Update for Traverson release 2.1.0 (including `convertResponseToObject()`).
* 2.1.3 2015-05-07 (using traverson 2.0.1):
    * Enable projects that depend on traverson-angular to use angular-mocks to test traverson-angular related code ([#12](https://github.com/basti1302/traverson-angular/issues/12), thanks to @meyertee)
* 2.1.2 2015-05-04 (using traverson 2.0.1):
    * Update to Traverson 2.0.1, including a fix for issue [#11](https://github.com/basti1302/traverson-angular/issues/11) (cloning a continued traversal (via `continue`) with `newRequest`).
* 2.1.1 2015-04-30 (using traverson 2.0.0):
    * Allow chaining .useAngularHttp() method (thanks to @joshuajabbour)
* 2.1.0 2015-04-11 (using traverson 2.0.0):
    * Option to use AngularJS' $http service instead of Traverson's HTTP module.
* 2.0.0 2015-04-08:
    * [Continue link traversals](#continuing-a-link-traversal) with `continue()` (also see [Traverson's docs](https://github.com/basti1302/traverson#continuing-a-link-traversal) and [Traverson's API docs](https://github.com/basti1302/traverson/blob/master/api.markdown#traversal-continue)).
    * The action methods (`get`, `getResource`, `post`, ...) now return an object which has the property `result` which is the promise which had been returned directly until version 1.0.1. Thus, `getResource().then(...)` becomes `getResource().result.then(...)`. The old syntax `getResource().then(...)` was deprecated in version 1.1.0 and has been removed with this version.
* 1.2.1 2015-03-16:
    * Bugfix: fix `getUri` alias for `getUrl`.
* 1.2.0 2015-03-15:
    * See [Traverson's release notes](https://github.com/basti1302/traverson#release-notes)
    * The method `getUri` has been renamed to `getUrl`. `getUri` is now deprecated, but is kept as an alias for `getUrl`.
* 1.1.0 2015-03-03:
    * See [Traverson's release notes](https://github.com/basti1302/traverson#release-notes)
    * The new feature to abort a link traversal process made it necessary to change the API: The action methods (`get`, `getResource`, `post`, ...) now return an object which has the property `result` which is the promise which had been returned directly until version 1.0.1. Thus, `getResource().then(...)` becomes `getResource().result.then(...)`. The old syntax `getResource().then(...)` still works for now, but is deprecated and will be removed in version 2.0.0.
* 1.0.1 2015-03-02:
    * Use minification-proof array notation (#5, #6) (thanks to @jamiegaines)
* 1.0.0 2015-02-27:
    * Fixed humongous bug that only allowed GET requests but thwarted POST, PUT, PATCH and DELETE requests (#2 and #4) (thanks to @binarykitchen).
    * Traverson 1.0.0 contains a lot of changes, even some breaking changes regarding HAL. See [Traverson's release notes](https://github.com/basti1302/traverson#release-notes).
* 0.15.0 2014-12-06: See [Traverson's release notes](https://github.com/basti1302/traverson#release-notes)
* 0.14.0 2014-12-05: See [Traverson's release notes](https://github.com/basti1302/traverson#release-notes)
* 0.13.0 2014-12-01
   * Reduce size of browser build by 33%. The minified version now has 37k instead of 55k (still too much, but also much better than before)
* 0.12.0 2014-11-29:
    * Initial release

License
-------

MIT
