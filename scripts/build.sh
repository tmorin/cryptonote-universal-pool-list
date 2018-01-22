#!/usr/bin/env sh

PKG_VERSION=`grep "\"version\" *: *\"[0-9]*\.[0-9]*\.[0-9]*\" *," package.json | sed "s/\"version\" *: *\"//i;s/\" *,//i;s/ //g;"`
echo "PKG_VERSION: $PKG_VERSION"

IMAGE_NAME="thibaultmorin/cryptonote-universal-pool-list:$PKG_VERSION"
echo "IMAGE_NAME: $IMAGE_NAME"

echo "building $IMAGE_NAME"
npm install
npm run build
docker build --rm -t ${IMAGE_NAME} .
docker push ${IMAGE_NAME}
