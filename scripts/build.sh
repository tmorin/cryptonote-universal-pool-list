#!/usr/bin/env sh

IMAGE_NAME="thibaultmorin/cryptonote-universal-pool-list:$CIRCLE_BRANCH"
echo "IMAGE_NAME: $IMAGE_NAME"

echo "building $IMAGE_NAME"
npm install
npm run build
docker build --rm -t ${IMAGE_NAME} .
docker push ${IMAGE_NAME}
