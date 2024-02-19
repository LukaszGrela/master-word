# Node JS backend

Game server for Master Word App.

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
