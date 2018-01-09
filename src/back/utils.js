import request from 'request';

export function httpGet(url, options) {
    return new Promise((resolve, reject) => {
        request.get(url, options, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        })
    });
}