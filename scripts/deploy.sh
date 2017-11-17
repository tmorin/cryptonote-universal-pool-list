#!/usr/bin/env sh

docker build --rm -t cryptonote-universal-pool-list .
docker rm -f cryptonote-universal-pool-list
docker run -d --network=containers --restart always --name cryptonote-universal-pool-list \
    -e ENV_NAME=cryptonote-universal-pool-list \
    -e VIRTUAL_HOST=intensecoin-pools.morin.io \
    -e VIRTUAL_PORT=8888 \
    -e LETSENCRYPT_HOST=intensecoin-pools.morin.io \
    -e LETSENCRYPT_EMAIL=intensecoin-pools@morin.io \
    cryptonote-universal-pool-list
