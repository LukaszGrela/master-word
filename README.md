# Master Word

Guess a 5 letter word in least attempts.

Project contains React `frontend` for game, NodeJS game server `backend` and `admin` UI to manage database.

[Live Example - Master Word](https://master-word.greladesign.co/)

## Frontend

Frontend (React+Typescript+Vite) for actual game.

## Backend

The backend is using MongoDB database to store game information e.g. dictionary.

Polish dictionary is stored in the database, there is a logger endpoint for unknown words that is stored in database, at some intervals those "unknown words" will be reviewed and moved into dictionary (using admin page).

English words are provided via the Frontend Masters API https://words.dev-apis.com/word-of-the-day.

## Admin

Frontend (React+Typescript+Vite+MUI) for managing backend.
