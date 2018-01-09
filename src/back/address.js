import {getCachedServer} from './servers';
import {checkAddressFromDefaultServer} from './impl/default';
import {checkAddressFromNodejsPool} from "./impl/nodejsPool";

function checkServer(server, address) {
    switch (server.impl) {
        case 'nodejs-pool':
            return checkAddressFromNodejsPool(server, address);
        default:
            return checkAddressFromDefaultServer(server, address)
    }
}

export function checkAddress(address) {
    return Promise.all(
        getCachedServer()
            .filter(s => !s.disabled)
            .filter(s => !s.error)
            .map(({key, name, front, back, stats, impl}) => ({key, name, front, back, stats, impl}))
            .map(server => checkServer(server, address))
    ).then(servers => servers.filter(s => !s.error));
}