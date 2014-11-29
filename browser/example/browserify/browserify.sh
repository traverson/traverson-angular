#!/usr/bin/env bash

bin_path=`dirname $0`
pushd $bin_path > /dev/null


node_modules/.bin/browserify \
  --entry example.js \
  --outfile bundle.js

popd > /dev/null
