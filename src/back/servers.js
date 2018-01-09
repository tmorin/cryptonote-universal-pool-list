import glob from 'glob';
import path from 'path';
import fs from 'fs';
import {conf, CURRENCY} from './config';
import {fetchNodejsPoolImpl} from './impl/nodejsPool';
import {fetchDefaultImpl} from './impl/default';

let shouldUpdateCache = true;
let cache = [];
let updatedOn = (new Date()).toISOString();

function loadServers() {
    return new Promise((resolve, reject) => {
        glob(`../config/${CURRENCY}/**/*.json`, {
            cwd: __dirname
        }, (error, files) => {
            if (error) {
                return reject(error);
            }
            Promise.all(files.map(f => path.resolve(__dirname, f)).map(loadServer))
                .then(resolve)
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
        });
    })
}

function loadServer(f) {
    return new Promise((resolve, reject) => {
        fs.readFile(f, {}, (error, content) => {
            if (error) {
                return reject(error);
            }
            const key = path.basename(f).replace(/.json$/i, '');
            try {
                const server = JSON.parse(content);
                resolve(Object.assign(server, {key}));
            } catch (e) {
                resolve(Object.assign({key}, {
                    error: 'definition cannot be loaded'
                }));
            }
        })
    })
}

function fetchStats(server) {
    switch (server.impl) {
        case 'nodejs-pool':
            return fetchNodejsPoolImpl(server);
        default:
            return fetchDefaultImpl(server);
    }
}

function fetchAllStats() {
    shouldUpdateCache = false;
    return loadServers()
        .then(servers => Promise.all(servers.filter(s => !s.disabled).map(fetchStats)))
        .then(servers => {
            cache = servers;
            updatedOn = (new Date()).toISOString();
            return {
                servers,
                updatedOn
            };
        });
}

setInterval(function () {
    shouldUpdateCache = true;
}, conf('worker').interval_ms || 5 * 60 * 1000);

export function fetchServers() {
    if (shouldUpdateCache) {
        return fetchAllStats();
    }
    return Promise.resolve({
        servers: cache,
        updatedOn
    });
}

export function getCachedServer() {
    return cache;
}

fetchAllStats();