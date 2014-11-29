#!/usr/bin/env bash

bin_path=`dirname $0`
pushd $bin_path > /dev/null

watchify \
  --entry example.js \
  --outfile bundle.js \
  --debug \
  --verbose
  &

popd > /dev/null
