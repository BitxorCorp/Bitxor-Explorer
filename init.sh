#!/bin/bash

set -ex

git submodule update --init
git -C _bitxor config core.sparseCheckout true
echo 'jenkins/*' >>.git/modules/_bitxor/info/sparse-checkout
echo 'linters/*' >>.git/modules/_bitxor/info/sparse-checkout
git submodule update --force --checkout _bitxor
