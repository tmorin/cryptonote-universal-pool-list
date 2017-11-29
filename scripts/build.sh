#!/usr/bin/env sh

currency=$1

docker kill cryptonote-universal-pool-list
docker rm cryptonote-universal-pool-list

docker build --tag cryptonote-universal-pool-list .
docker run --name cryptonote-universal-pool-list \
    -e VIRTUAL_HOST=${currency}-pools.morin.io,${currency}-pools.containers \
    -e VIRTUAL_PORT=8888 \
    -e CURRENCY=${currency} \
    cryptonote-universal-pool-list
