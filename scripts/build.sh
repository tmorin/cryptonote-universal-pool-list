#!/usr/bin/env sh

IMAGE_NAME="thibaultmorin/cryptonote-universal-pool-list:${CIRCLE_TAG:-CIRCLE_BRANCH}"
echo "IMAGE_NAME: $IMAGE_NAME"

echo "building $IMAGE_NAME"
npm install
npm run build
docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
docker build --rm -t ${IMAGE_NAME} .
docker push ${IMAGE_NAME}
