export const HTTP_TIMEOUT = 1000;
export const CURRENCY = process.env.CURRENCY;
if (!CURRENCY) {
    throw new Error('No currency provided as environment variable!');
}

console.log('currency', CURRENCY);
const config = require(`../config/${CURRENCY}.json`);
console.log('config', config);

export function conf(domain) {
    return config[domain] || {};
}
