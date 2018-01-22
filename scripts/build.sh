#!/usr/bin/env sh

IMAGE_VERSION=`echo ${CIRCLE_TAG:=$CIRCLE_BRANCH} | sed -e "s/^v//"`
IMAGE_NAME="thibaultmorin/cryptonote-universal-pool-list:${IMAGE_VERSION}"
echo "CIRCLE_TAG: $CIRCLE_TAG"
echo "CIRCLE_BRANCH: $CIRCLE_BRANCH"
echo "IMAGE_NAME: $IMAGE_NAME"

echo "building $IMAGE_NAME"
npm install
npm run build
docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
docker build --rm -t ${IMAGE_NAME} .
docker push ${IMAGE_NAME}
