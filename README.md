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

### Roadmap

Few features are still to develop, below is a list divided by the module

- monorepo setup with shared code module

#### Admin

- Use RTK and QTK for API calls
- Show Unknown Words Stats widget - rechart driven
- Config route

#### Backend

- word count attached to the game session
- store last game elapsed time (for comparison of best times)
- Unknown Words Stats functionality
- Game session data in DB
- Archive game sessions in DB
- Config functionality
- measure transaction times and accumulate offset to adjust game time (so longer responses do not affect the game play time)

#### Game

- display dictionary (word count) length
- show last game time comparison
- add some animations
- use config info
- share game - owner shares a link to the game for preview only
- save game - owner has access to the session of the game and can continue e.g. on another machine
