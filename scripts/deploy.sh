#!/usr/bin/env sh

currency=$1

docker build --rm -t ${currency}-universal-pool-list .
docker rm -f ${currency}-universal-pool-list
docker run -d --network=containers --restart always --name ${currency}-universal-pool-list \
    -e ENV_NAME=${currency}-universal-pool-list \
    -e VIRTUAL_HOST=${currency}-pools.morin.io \
    -e VIRTUAL_PORT=8888 \
    -e LETSENCRYPT_HOST=${currency}-pools.morin.io \
    -e LETSENCRYPT_EMAIL=${currency}-pools@morin.io \
    -e CURRENCY=${currency} \
    ${currency}-universal-pool-list
