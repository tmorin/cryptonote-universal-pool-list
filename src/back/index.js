import express from 'express';
import request from 'request';
import {CURRENCY} from './config';
import {fetchServers} from './servers';
import {checkAddress} from './address';

const app = express();

app.use(express.static('public', {
    index: `${CURRENCY}.html`
}));

request.defaults({
    strictSSL: false
});

app.get('/api/servers', (req, res) => {
    fetchServers()
        .then(payload => res.send(payload))
        .catch(error => {
            console.error(error);
            res.status(500).end();
        });
});

app.get('/api/address/:address', (req, res) => {
    checkAddress(req.params.address)
        .then(payload => res.send(payload))
        .catch(error => {
            console.error(error);
            res.status(500).end();
        });
});

app.listen(8888, () => {
    console.log('App listening on port 8888!');
});
