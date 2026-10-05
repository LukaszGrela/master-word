# Node JS backend

Game server for the Master Word App.

**Note** English dictionary is handled by the Frontend Masters API
<https://words.dev-apis.com/> (the `/word-of-the-day` and `/validate-word`
endpoints).

## Tech

NodeJS + Express + MongoDB + Mongoose + Mocha

## Prerequisites

- Node.js `>=18` (the monorepo pins Node `20.5.1` and npm `9.8.0` via
  [Volta](http://volta.sh/)).
- Dependencies installed from the repository root with `npm install`.
- A running MongoDB instance (see [MongoDB, Mongoose](#mongodb-mongoose)).

## Run locally

The backend reads environment variables from `.env.local`, `.env.secret` and
`.env` (in that order) in this folder. See
[Environment variables](#environment-variables) for the full list. Create at
least `apps/backend/.env.local` and, if your database user has a password,
`apps/backend/.env.secret`. Do not commit them.

Start the server from the repository root:

```sh
npm run dev --workspace=backend
```

Or from this folder:

```sh
npm run dev
```

`npm run dev` runs `nodemon src/index.ts` with `NODE_ENV=development`, which
also turns on Mongoose debug logging.

The local dev server listens on port `3001` by default
(http://localhost:3001). Override it with the `PORT` environment variable. The
server accepts CORS requests from the deployed frontend/admin domains and from
`http://localhost:5273` / `http://localhost:5274`.

Note: the API is mounted under `/api`, so the frontend expects
`http://localhost:3001/api/frontend` and the admin expects
`http://localhost:3001/api`.

### Scripts

| Script               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Run the server with nodemon (`NODE_ENV=development`)     |
| `npm run build`      | Bundle `src/index.ts` into `dist/` with esbuild          |
| `npm run build-tsc`  | Alternative build with `tsc` (`NODE_ENV=production`)     |
| `npm run type-check` | Run `tsc --noEmit`                                       |
| `npm run test`       | Run the Mocha suite (`NODE_ENV=test`)                    |
| `npm run coverage`   | Run tests through nyc                                    |
| `npm run lint`       | Run ESLint                                               |
| `npm run clean`      | Remove `dist/`                                           |

## Environment variables

| Variable                     | Required        | Description                                                                                              |
| ---------------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| `APP_CONFIG`                 | yes             | JSON string with the MongoDB connection, e.g. `{"mongo":{"hostString":"localhost:27017/master-word","user":"master-word-user","db":"master-word"}}` |
| `MONGO_PASSWORD`             | if `mongo.user` | Password for `mongo.user`, URL-encoded when building the connection string                                |
| `MONGO_BACKEND_DEV_PASSWORD` | for dev connection | Password for the `master-word-backend-dev` MongoDB user used by the dictionary dev connection          |
| `ADMIN_API_TOKEN`            | yes in production | Bearer token required by every `/api/backend/*` route. If unset, those routes fail closed with `401`   |
| `PORT`                       | no              | Port to listen on, defaults to `3001`                                                                     |
| `NODE_ENV`                   | no              | `development` enables Mongoose debug logging; `test` adjusts the dev DB connection                        |

`mongo.user` and `MONGO_PASSWORD` can be omitted for a local MongoDB without
authentication. Hosted providers (for example EvenNode) may append the database
name to the `hostString`.

### Admin API authentication

All `/api/backend/*` routes are wrapped by `ensureLoggedIn()`
(`src/router/helpers.ts`). In production the request must carry the
`ADMIN_API_TOKEN`; if the token is missing the server responds `401` rather than
allowing the request. Generate a strong random value and keep it out of version
control.

## Gameplay Endpoints

- `GET` - `api/frontend/init` - Starts new game
  - URL Query `language` - defaults to `pl`, supported values `pl`,`en`. For which language to start the game.
  - URL Query `session` - defaults to `undefined`. A previous game session id. If valid a game can be resumed (if not finished already).
  - response
- `GET` - `api/frontend/guess` - Continues the game by sending guessed word to compare.
  - URL Query `session` - required. Session id recieved from the `init` api.
  - URL Query `guess` - required. Guess attempt to compare.

## Non game endpoints

- `GET` - `api/frontend/config` - get configuration object for the game

- `GET` - `api/random-word` - get random word from available dictionary.
  - URL Query `language` - defaults to `pl`, supported values `pl`,`en`. For which language to pick a word.
- `POST` - `api/validate-word` - check if given word will be accepted (is correct).
  - JSON Body:
    - `word` - required, word to check.
    - `language` - optional, defaults to `pl` - for which language check the word against.
  - Response JSON Body:
    - `word` - word that was validated
    - `langauge` - language of the word
    - `validWord` - boolean - flag if the word is correct or not

## Admin endpoints

All routes below require the `ADMIN_API_TOKEN` (see
[Admin API authentication](#admin-api-authentication)).

- `GET` - `api/backend/configuration` - get configuration object matching optional `appId` param
  - URL Query `appId` - app identifier single or list, optional.
- `POST` - `api/backend/configuration/reset` - resets the configuration collection to use default values
- `POST` - `api/backend/configuration/set/:configKey` - set new value to the configuration object
  - `:configKey` - configuration key to update
  - JSON Body:
    - `appId` - Array of application ID's this config entry should apply
    - `key` - configuration object key
    - `value` - value of the configuration
- `POST` - `api/backend/configuration/set-multiple` - set new configuration values to many config entries
  - JSON Body (an Array of):
    - `appId` - Array of application ID's this config entry should apply
    - `key` - configuration object key
    - `value` - value of the configuration
- `POST` - `api/backend/add-word` - add new word to dictionary collection
  - JSON Body:
    - `word` - new word to add
    - `language` - what language it is
    - `length` - what lenght of the word it should be
- `GET` - `api/backend/list` - list unknown words entries
- `POST` - `api/backend/approve-words` - approve a list of unknown words
  - JSON Body:
    - `words` - an array of `TTableData`
- `POST` - `api/backend/reject-words` - reject a list of unknown words
  - JSON Body:
    - `words` - an array of `TTableData`
- `POST` - `api/backend/add-many-words` - adds many new words to the dictionary collection
  - JSON Body:
    - `words` - list of words
    - `language` - what language it is
    - `length` - what lenght of the word it should be
- `GET` - `dictionary-stats` - retrieve dictionary statistics
  - URL Query:
    - `language` - defaults to `pl` - language of the dictionary
    - `length` - defaults to `5` - length of the word
- `GET` - `dictionary-languages` - retrieve dictionary languages
  - URL Query:
    - `length` - defaults to `5` - length of the word

## MongoDB, Mongoose

The backend uses MongoDB to store game information. Mongoose is used as a
"MongoDB object modeling for NodeJS".

To run it locally you need the `.env.local` file first, which contains the
connection details (JSON string):

```shell script
APP_CONFIG='{"mongo":{"hostString":"localhost:27017/master-word","user":"master-word-user","db":"master-word"}}'
```

Important is `hostString` and `db`; `user` can be skipped. `user` is used by
hosted MongoDB, e.g. on EvenNode hosting (which also appends the `db` name to
the `hostString`). If your local db doesn't use `user`, remove it from the
config.

A second file called `.env.secret` will contain the password to the MongoDB
user. It can be skipped if you do not create a user:

```shell script
MONGO_PASSWORD=
```

Note: your local MongoDB must run for this server to work.

### Installation of Mongo

Described on the [mongodb website](https://www.mongodb.com/docs/v6.0/tutorial/install-mongodb-on-ubuntu/) (here for ubuntu linux, mongo version 6). There are directions for other OS's.

#### Scripts for Linux

Below are scripts to run a MongoDB instance locally on a Linux machine.

##### Run mongo instance (locally)

```
sudo systemctl start mongod
```

##### Reload service deamon

```
sudo systemctl daemon-reload
```

##### Verify mongo is running

```
sudo systemctl status mongod
```

##### Stop Mongo

```
sudo systemctl stop mongod
```

##### Restart mongo

```
sudo systemctl restart mongod
```

### Schemas

#### Dictionary

The `Dictionary` will hold the information about words that the app is using, for now it will be used only for polish words.

```TypeScript
const DictionarySchema = new Schema({
  language: { type: SupportedLanguage, required: true },
  length: { type: Types.Number, required: true },
  letter: { type: Types.String, maxLength: 1, required: true },
  words: {
    type: [
      {
        type: Types.String,
        maxlength: 5,
        minlength: 5,
      },
    ],
  },
});
```

Each document will be unique per `language`,`length` and `letter` combination. The document will hold words only for specific letter. Then for random picking a word full dictionary dont need to be loaded.

### Import data into database

#### MongoSh

With mongo shell you can use the ability to load external script in order to automate importing of data. You may find suggestions to put `use your_database` at the top of that script file, but from my experience it was failing, and script was stopped at this line wiht no log output.

Instead you can add this directive to the `eval` param of `mongosh` CLI command:

```CLI
mongosh --eval 'use your_database'
```

To load your script you can either pass the path to it in the `file` param (combined with eval from previous snippet):

```CLI
mongosh --eval 'use your_database' --file path/to/script.js
```

or open mongo shell and then use the `load` function (selecting database first)

```JS
use your_database
load('path/to/script.js')
```

If you want to load external data file into script, you may find that suggested `load` will not work for you, as it returns `boolean` for success of loading data, not the data itself. It also expects that loaded file is a script where the data is assigned to a variable which is not what you would normally have. Instead use `fetch` if you have remote data to get or methods from `fs` module e.g. `readFileSync`.

Below is a sample script that loads a list of words from a JSON file:

```JSON
[
  "ala",
  "ola",
  "ela",
  "ula"
]
```

```JavaScript
// import.js
const run = async () => {
  try {
    const words = JSON.parse(fs.readFileSync(`list.json`));

    if (!words || words.length === 0) {
      throw new Error('No words to load');
    }
    print(`Loaded ${words.length} words`);


    exit(0);
  } catch (error) {
    print(error);
    exit(1);
  }
};

run();
```

## Production

1. Set the production environment variables on the host:
   - `APP_CONFIG` — MongoDB connection JSON (the EvenNode host string already
     includes the database name),
   - `MONGO_PASSWORD` — password for the MongoDB user,
   - `MONGO_BACKEND_DEV_PASSWORD` — password for the dictionary dev user,
   - `ADMIN_API_TOKEN` — required; without it the `/api/backend/*` routes return
     `401`,
   - `PORT` — optional, defaults to `3001`,
   - `NODE_ENV=production`.

2. Build the deployable bundle from the repository root:

   ```sh
   npm run build --workspace=backend
   ```

   The build runs `esbuild` to bundle `src/index.ts` into `dist/index.js`,
   externalising `express`, `cors`, `mongoose`, `uuid`, `dotenv` and
   `http-status-codes`. The `postbuild` step (`scripts/deploy-package-json.js`)
   writes a trimmed `dist/package.json` for the deployed bundle.

3. Upload `dist/` to the Node host and start it, e.g. `node dist/index.js`.
   Ensure the externalised runtime dependencies are installed in the deployment
   target (or build on the host so `node_modules` is present).

> Note: the concrete hosting provider, domain and MongoDB plan are operational
> details and are not fully encoded in this repository. The steps above describe
> what the checked-in configuration expects.

## Turborepo

This module could not bundle (transpile) code from internal packages (e.g.
`@repo/utils`), so the `tsc` build was replaced with `esbuild`, which bundles
all the code. It is fine so far but needs a review as it feels dirty.