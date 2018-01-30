#!/usr/bin/env sh

git fetch
git checkout -b master origin/master
git checkout -b production origin/production

git checkout production

git merge origin/master
git push

git checkout master
