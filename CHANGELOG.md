# [7.0.0-alpha.3](https://github.com/traverson/traverson-angular/compare/v7.0.0-alpha.2...v7.0.0-alpha.3) (2020-03-25)


### Build System

* limited the files included to the minimum required ([39b2992](https://github.com/traverson/traverson-angular/commit/39b2992b53be37baa0fd71d746d1c101667cc05c))


### BREAKING CHANGES

* limited the published files to those used by the public api. use of private files
could break with this change

# [7.0.0-alpha.2](https://github.com/traverson/traverson-angular/compare/v7.0.0-alpha.1...v7.0.0-alpha.2) (2020-02-23)


### chore

* **bower:** dropped support for bower ([25592c1](https://github.com/traverson/traverson-angular/commit/25592c139334d691c2040547d9238de301df30f2))


### BREAKING CHANGES

* **bower:** Bower is no longer supported

Release Notes
-------------

* 0.12.0 2014-11-29:
    * Initial release
* 0.13.0 2014-12-01
   * Reduce size of browser build by 33%. The minified version now has 37k instead of 55k (still too much, but also much better than before)
* 0.14.0 2014-12-05: See [Traverson's release notes](https://github.com/traverson/traverson#release-notes)
* 0.15.0 2014-12-06: See [Traverson's release notes](https://github.com/traverson/traverson#release-notes)
* 1.0.0 2015-02-27:
    * Fixed humongous bug that only allowed GET requests but thwarted POST, PUT, PATCH and DELETE requests (#2 and #4) (thanks to @binarykitchen).
    * Traverson 1.0.0 contains a lot of changes, even some breaking changes regarding HAL. See [Traverson's release notes](https://github.com/traverson/traverson#release-notes).
* 1.0.1 2015-03-02:
    * Use minification-proof array notation (#5, #6) (thanks to @jamiegaines)
* 1.1.0 2015-03-03:
    * See [Traverson's release notes](https://github.com/traverson/traverson#release-notes)
    * The new feature to abort a link traversal process made it necessary to change the API: The action methods (`get`, `getResource`, `post`, ...) now return an object which has the property `result` which is the promise which had been returned directly until version 1.0.1. Thus, `getResource().then(...)` becomes `getResource().result.then(...)`. The old syntax `getResource().then(...)` still works for now, but is deprecated and will be removed in version 2.0.0.
* 1.2.0 2015-03-15:
    * See [Traverson's release notes](https://github.com/traverson/traverson#release-notes)
    * The method `getUri` has been renamed to `getUrl`. `getUri` is now deprecated, but is kept as an alias for `getUrl`.
* 1.2.1 2015-03-16:
    * Bugfix: fix `getUri` alias for `getUrl`.
* 2.0.0 2015-04-08:
    * [Continue link traversals](#continuing-a-link-traversal) with `continue()` (also see [Traverson's docs](https://github.com/traverson/traverson#continuing-a-link-traversal) and [Traverson's API docs](https://github.com/traverson/traverson/blob/master/api.markdown#traversal-continue)).
    * The action methods (`get`, `getResource`, `post`, ...) now return an object which has the property `result` which is the promise which had been returned directly until version 1.0.1. Thus, `getResource().then(...)` becomes `getResource().result.then(...)`. The old syntax `getResource().then(...)` was deprecated in version 1.1.0 and has been removed with this version.
* 2.1.0 2015-04-11 (using traverson 2.0.0):
    * Option to use AngularJS' $http service instead of Traverson's HTTP module.
* 2.1.1 2015-04-30 (using traverson 2.0.0):
    * Allow chaining .useAngularHttp() method (thanks to @joshuajabbour)
* 2.1.2 2015-05-04 (using traverson 2.0.1):
    * Update to Traverson 2.0.1, including a fix for issue [#11](https://github.com/traverson/traverson-angular/issues/11) (cloning a continued traversal (via `continue`) with `newRequest`).
* 2.1.3 2015-05-07 (using traverson 2.0.1):
    * Enable projects that depend on traverson-angular to use angular-mocks to test traverson-angular related code ([#12](https://github.com/traverson/traverson-angular/issues/12), thanks to @meyertee)
* 2.1.4 2015-08-27 (using traverson 2.1.0):
    * Update for Traverson release 2.1.0 (including `convertResponseToObject()`).
* 3.0.0 2015-09-16:
    * Update for Traverson release 3.0.0 (including `followLocationHeader()`).
* 3.1.0 2015-11-10:
    * Update to Traverson release 3.1.0 (including `withCredentials`).
* 3.1.1 2015-12-21:
    * Update to Traverson release 3.1.1, including an update from JSONPath 0.10 to jsonpath-plus 0.13. (Fixes [#20](https://github.com/traverson/traverson-angular/issues/20).)
* 5.0.0 2016-12-20:
    * Update to Traverson release 5.0.0.
    * See [Traverson's release notes](https://github.com/traverson/traverson/blob/master/CHANGELOG.md)
* 6.0.0 2017-02-10:
    * Update to Traverson release 6.0.1 (including auto headers).
* 6.0.1 2018-07-19:
    * Update to Traverson release 6.0.4.
* 6.1.0 2018-09-10:
    * Update to Traverson release 6.1.0.
