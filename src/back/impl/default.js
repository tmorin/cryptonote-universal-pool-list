import request from 'request';
import {HTTP_TIMEOUT} from '../config';

export function fetchDefaultImpl(server) {
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
