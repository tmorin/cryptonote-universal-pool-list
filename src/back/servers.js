import glob from 'glob';
import path from 'path';
import fs from 'fs';
import request from 'request';
import {conf, CURRENCY, HTTP_TIMEOUT} from './config';

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
    return new Promise((resolve) => {
        const url = `${server.back}/stats`;
        request.get(url, {timeout: HTTP_TIMEOUT}, (err, res) => {
            try {
                if (err) {

                    console.error(err);
                    resolve(Object.assign({
                        error: err.message
                    }, server));

                } else if (res.statusCode >= 200 && res.statusCode < 300) {

                    resolve(Object.assign({
                        stats: JSON.parse(res.body)
                    }, server));

                } else {

                    resolve(Object.assign({
                        error: `${url} returned an error`
                    }, server));

                }
            } catch (e) {
                console.warn(`${url} returned an error`);
                console.warn(e);
                resolve(Object.assign({
                    error: `${url} cannot be parsed`
                }, server));
            }
        });
    });
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