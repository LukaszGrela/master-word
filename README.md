# Master Word

Guess a 5 letter word in least attempts.

Project contains React `frontend` for game, NodeJS game server `backend` and `admin` UI to manage database.

The backend is using MongoDB database to store game information.

Polish dictionary is stored in the database, there is a logger endpoint for unknown words that is stored in database, at some intervals those "unknown words" will be reviewed and moved into dictionary.

English words are provided via the Frontend Masters API https://words.dev-apis.com/word-of-the-day.

[Live Example - Master Word](https://master-word.greladesign.co/)
