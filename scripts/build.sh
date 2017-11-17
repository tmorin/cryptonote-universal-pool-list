#!/usr/bin/env sh

docker kill cryptonote-universal-pool-list
docker rm cryptonote-universal-pool-list

docker build --tag cryptonote-universal-pool-list .
docker run --name cryptonote-universal-pool-list \
    -e VIRTUAL_HOST=intensecoin-pools.morin.io,intensecoin-pools.containers \
    -e VIRTUAL_PORT=8888 \
    cryptonote-universal-pool-list
