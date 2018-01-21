export const HTTP_OPTIONS = {
    timeout: 1000 * 5,
    strictSSL: false
};

export const PRODUCTION = process.env.NODE_ENV === 'production';
console.log('PRODUCTION', PRODUCTION);

export const CURRENCY = process.env.CURRENCY;
if (!CURRENCY) {
    throw new Error('No currency provided as environment variable!');
}
console.log('CURRENCY', CURRENCY);

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
if (!GITHUB_CLIENT_ID) {
    throw new Error('No GITHUB_CLIENT_ID provided as environment variable!');
}
console.log('GITHUB_CLIENT_ID', GITHUB_CLIENT_ID);

export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
if (!GITHUB_CLIENT_SECRET) {
    throw new Error('No GITHUB_CLIENT_SECRET provided as environment variable!');
}
console.log('GITHUB_CLIENT_SECRET', GITHUB_CLIENT_SECRET);

let baseUrl = 'https://localhost:9000';
let homeUrl = `${baseUrl}/${CURRENCY}.html`;
if (PRODUCTION) {
    baseUrl = process.env.BASE_URL;
    homeUrl = `${baseUrl}`;
}
if (!baseUrl) {
    throw new Error('No BASE_URL provided as environment variable!');
}
export const CALLBACK_URL = `${baseUrl}/auth/github/callback`;
export const HOME_URL = homeUrl;

console.log('CALLBACK_URL', CALLBACK_URL);
console.log('HOME_URL', HOME_URL);

const config = require(`../config/${CURRENCY}.json`);

export function conf(domain) {
    return config[domain] || {};
}
