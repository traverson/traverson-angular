#!/usr/bin/env bash

# Script to browserify without Grunt - usually the Grunt build is used to
# browserify and build everything.

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null

browserify_cmd=node_modules/.bin/browserify

# This browserify build can be used by users of the module. It contains a
# UMD (universal module definition) and can be used via an AMD module
# loader like RequireJS or by simply placing a script tag in the page,
# which registers mymodule as a global var. You can see an example
# in browser/example/index.html.
$browserify_cmd \
  --entry traverson-angular.js \
  --outfile browser/dist/traverson-angular.js \
  --standalone traverson-angular

# This browserify build can be required by other browserify modules that
# have been created with an --external parameter. browser/test/index.html uses
# this.
$browserify_cmd \
  --entry traverson-angular.js \
  --outfile browser/dist/traverson-angular.external.js \
  --require ./traverson-angular

# These are the browserified tests.
$browserify_cmd \
  --entry test/browser_suite.js \
  --outfile browser/test/browserified_tests.js \
  --external ./traverson-angular.js

popd > /dev/null
