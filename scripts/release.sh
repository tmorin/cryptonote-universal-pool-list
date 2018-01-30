#!/usr/bin/env sh

npm version $1
git push
git push --tags
