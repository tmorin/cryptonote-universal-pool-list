import request from 'request';
import {getCachedServer} from './servers';
import {HTTP_TIMEOUT} from "./config";

function checkServer(server, address) {
    return new Promise((resolve) => {
        const url = `${server.back}/stats_address?address=${address}&longpoll=false`;
        request.get(url, {timeout: HTTP_TIMEOUT}, (err, res) => {
            try {
                if (err) {
                    console.error(err);
                    resolve(Object.assign({
                        error: err.message
                    }, server));
                } else if (res.statusCode >= 200 && res.statusCode < 300) {
                    const body = JSON.parse(res.body);
                    if (body.error) {
                        resolve(Object.assign(body, server));
                    } else {
                        resolve(Object.assign({address: body}, server));
                    }
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

export function checkAddress(address) {
    return Promise.all(
        getCachedServer()
            .filter(s => !s.disabled)
            .filter(s => !s.error)
            .map(({key, name, front, back, stats}) => ({key, name, front, back, stats}))
            .map(server => checkServer(server, address))
    ).then(servers => servers.filter(s => !s.error));
}