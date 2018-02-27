# Add or update your pool

Change about pools are managed with pull requests.
That means you have to do the change your-self and then submit a pool request.

## Fork the repository

The first step is to get the source code.
From https://github.com/tmorin/cryptonote-universal-pool-list, fork the repository.
Then checkout it locally.

## Setup environment

The second step is to setup and start the dev environment.

Install the dependencies:
```bash
npm install
```

Start the frontend in watching mode:
```bash
npm run w:front
```

From another terminal, start the backend in watching mode:
```bash
npm run w:back:<currency symbol>
```

Presently, the currency symbols are:

- edc
- itns
- xlc
- fno
- sumo

## Apply your change

### How-to add a new pool?

New pool are defined in a new JSON file.
The path is `src/config/<currency>/<domain name>.json`.

The structure is:
```json
{
    "name": "<domain name>",
    "front": "<URL to front end>",
    "back": "<URL to backend end>",
    "location": "<localization>",
    "impl": "<nodejs-pool or cryptonote-universal-pool>",
    "disabled": false
}
```

For instance, about a pool backed by nodejs-pool:
```json
{
    "name": "edollar.hashvault.pro",
    "front": "https://edollar.hashvault.pro",
    "back": "https://edollar.hashvault.pro/api",
    "location": "RU",
    "impl": "nodejs-pool",
    "disabled": false
}
```

For instance, about a pool backed by cryptonote-universal-pool:
```json
{
    "name": "cryptonoteminingpool.com",
    "front": "http://cryptonoteminingpool.com",
    "back": "http://cryptonoteminingpool.com:8117",
    "location": "US",
    "impl": "cryptonote-universal-pool",
    "disabled": false
}
```

Once the change done, the backend will detect the change and reload the pool list.
From the front-end you just need to refresh the pool list.

### How-to update an existing pool?

To update an existing pool, you just need to edit the right file, i.e. `src/config/<currency>/<domain name>.json`.
Once the change done, the backend will detect the change and reload the pool list.
From the front-end you just need to refresh the pool list.

You can use the boolean `disabled` to virtually remove the pool from the list.

## Submit the pool request

Once change done, you can push the change to the forked repository.
Then from the github interface you should be able to submit a pool request to the official repository.
Once submitted the pool will be review and merged.
