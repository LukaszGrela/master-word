# Node JS backend

Game server for Master Word App.

**Note** English dictionary is handled by the Frontend Masters API https://words.dev-apis.com/ (the `/word-of-the-day` and `/validate-word` endpoints).

## Gameplay Endpoints

- `GET` - `api/init` - Starts new game
  - URL Query `language` - defaults to `pl`, supported values `pl`,`en`. For which language to start the game.
  - URL Query `session` - defaults to `undefined`. A previous game session id. If valid a game can be resumed (if not finished already).
  - response
- `GET` - `api/next-attempt` - Continues the game by sending guessed word to compare.
  - URL Query `session` - required. Session id recieved from the `init` api.
  - URL Query `guess` - required. Guess attempt to compare.

## Non game endpoints

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

## MongoDB, Mongoose

The backend is using the MongoDB to store game information. Mongoose is used as a "mongodb Object Modeling for NodeJS".

To run it locally you need 2 `.env` files first `.env.local` that will contain connection details (JSON stringified).

```shell script
APP_CONFIG='{"mongo":{"hostString":"localhost:27017/master-word","user":"master-word-user","db":"master-word"}}'
```

Important is `hostString` and `db`, `user` can be skipped. Unless you will use it then in your local mongo db create a user with `readWrite` access to the `db`.

Second file called `.env.secret` will contain the password to the mongodb user, it can be skipped if you do not create a user.

Note: Your local mongodb must run for this server to work.

## Schemas

### Dictionary

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

## Import data into database

### MongoSh

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
