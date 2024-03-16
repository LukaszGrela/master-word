# Master Word

Guess a 5 letter word in least attempts.

It is using [Turborepo](https://turbo.build/repo) to help with managing monorepo workspaces.

Project contains 3 `apps` workspaces: React `frontend` for game, NodeJS game server `backend` and `admin` UI to manage database. It contains (at the moment) 2 `packages` workspaces: `config-typescript` - shared typescript configuration and `utils` - some helpers used across `apps` workspaces.

[Live Example - Master Word](https://master-word.greladesign.co/)

## Tools

Make sure you have installed [Volta](http://volta.sh/) which ensures you have the right version of node and npm for this project.

## Frontend (Game)

Tech: React, React Router, Typescript, Vite, SASS

Frontend for actual game.

## Backend

Tech: NodeJS, Express, MongoDB, Mongoose, Mocha

The backend is using MongoDB document database to store game information e.g. dictionary.

Polish dictionary is stored in the database, there is a logger endpoint for unknown words that is stored in database, at some intervals those "unknown words" will be reviewed and moved into dictionary (using admin page).

English words are provided via the Frontend Masters API https://words.dev-apis.com/word-of-the-day.

## Admin

Tech: React, React Router, Redux, Typescript, Vite, MUI, RTK

Frontend for managing backend.

### Roadmap

Few features are still to be developed, below is a list divided by the module

#### Admin

- ~Use RTK and QTK for API calls~ [Feature #15](https://github.com/LukaszGrela/master-word/issues/15)
- Show Unknown Words Stats widget - rechart driven [Feature #14](https://github.com/LukaszGrela/master-word/issues/14)
- Config route [Feature #16](https://github.com/LukaszGrela/master-word/issues/16)
- Update and improve dictionary word count widget [Feature #17](https://github.com/LukaszGrela/master-word/issues/17)
- Session review [Feature #19](https://github.com/LukaszGrela/master-word/issues/19)
- Archived games review [Feature #20](https://github.com/LukaszGrela/master-word/issues/20)
- Manage shared sessions [Feature #21](https://github.com/LukaszGrela/master-word/issues/21)

#### Backend

- word count attached to the game session [Feature #17](https://github.com/LukaszGrela/master-word/issues/17)
- ~store last game elapsed time~ (for comparison of best times) [Feature #9](https://github.com/LukaszGrela/master-word/issues/9)
- Unknown Words Stats functionality [Feature #14](https://github.com/LukaszGrela/master-word/issues/14)
- Game session data in DB [Feature #19](https://github.com/LukaszGrela/master-word/issues/19)
- Archive game sessions in DB [Feature #20](https://github.com/LukaszGrela/master-word/issues/20)
- Config functionality [Feature #16](https://github.com/LukaszGrela/master-word/issues/16)
- measure transaction times and accumulate offset to adjust game time (so longer responses do not affect the game play time) [Feature #23](https://github.com/LukaszGrela/master-word/issues/23)
- shared game session [Feature #21](https://github.com/LukaszGrela/master-word/issues/21)

#### Game

- display dictionary (word count) length [Feature #17](https://github.com/LukaszGrela/master-word/issues/17)
- ~show last game time comparison~ [Feature #9](https://github.com/LukaszGrela/master-word/issues/9)
- add some animations [Feature #18](https://github.com/LukaszGrela/master-word/issues/18)
- use config info [Feature #16](https://github.com/LukaszGrela/master-word/issues/16)
- share game - owner shares a link to the game for preview only [Feature #21](https://github.com/LukaszGrela/master-word/issues/21)
- save game - owner has access to the session of the game and can continue e.g. on another machine [Feature #22](https://github.com/LukaszGrela/master-word/issues/22)
- View previous games for current session [Feature #20](https://github.com/LukaszGrela/master-word/issues/20)
- Use timer offset - [Feature #23](https://github.com/LukaszGrela/master-word/issues/23)
