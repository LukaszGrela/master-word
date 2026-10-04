# Master Word

Guess a 5 letter word in the least number of attempts.

[Live Example - Master Word](https://master-word.greladesign.co/)

It uses [Turborepo](https://turbo.build/repo) with npm workspaces to manage the
monorepo.

## Workspaces

The repository is split into deployable **apps** and shared **packages**.

| Workspace                  | Type   | Description                                              |
| -------------------------- | ------ | -------------------------------------------------------- |
| `apps/frontend`            | app    | React game UI (the game players use)                     |
| `apps/backend`             | app    | NodeJS/Express game server and admin API                 |
| `apps/admin`               | app    | React admin UI to manage the dictionary and configuration |
| `packages/backend-types`   | package | Types shared between the backend and the UIs            |
| `packages/common-types`    | package | Types shared across all apps                            |
| `packages/config-typescript` | package | Shared TypeScript configuration                       |
| `packages/shared-ui`       | package | Shared React UI components                              |
| `packages/utils`           | package | Small helpers used across apps                          |

## Prerequisites

- [Node.js](https://nodejs.org/) `>=18` (the repository pins Node `20.5.1` and
  npm `9.8.0` through [Volta](http://volta.sh/)). Installing Volta is the
  easiest way to get the exact versions used for development.
- npm (ships with Node). The root manifest declares `packageManager: npm@10.2.4`.
- [MongoDB](https://www.mongodb.com/) for the backend (see
  [apps/backend/README.md](apps/backend/README.md#mongodb-mongoose)).
- [Git](https://git-scm.com/).

## Getting started

```sh
# 1. Clone the repository
git clone https://github.com/LukaszGrela/master-word.git
cd master-word

# 2. Install all workspace dependencies from the repository root
npm install

# 3. Configure the backend database connection (see below)

# 4. Start every app in watch mode
npm run dev
```

`npm install` at the root installs the dependencies for every workspace. You
should not need to run it inside each app.

### Local development URLs and ports

| App      | URL                     | Notes                                   |
| -------- | ----------------------- | --------------------------------------- |
| frontend | http://localhost:5273   | Vite dev server                         |
| admin    | http://localhost:5274   | Vite dev server                         |
| backend  | http://localhost:3001   | Express API (`PORT`, defaults to 3001)  |

The backend allows CORS from `http://localhost:5273` and
`http://localhost:5274`, matching the Vite dev ports above.

### Backend configuration

The backend reads environment variables from `.env.local` and `.env`
(`apps/backend/src/db/connect.ts` also loads `.env.secret`). Create these files
inside `apps/backend/` and do not commit them (the `.gitignore` excludes
`*.local` and `*.secret`).

`apps/backend/.env.local`:

```shell script
# JSON string, read by apps/backend/src/db/connect.ts
APP_CONFIG='{"mongo":{"hostString":"localhost:27017/master-word","user":"master-word-user","db":"master-word"}}'
```

`apps/backend/.env.secret`:

```shell script
MONGO_PASSWORD=
```

`user` may be omitted for a local MongoDB without authentication. See the
[backend README](apps/backend/README.md#mongodb-mongoose) for the full list of
variables, including `ADMIN_API_TOKEN`, which is required to call the
`/api/backend/*` admin routes.

## Root scripts

Run these from the repository root; Turborepo fans them out to the workspaces.

| Script                   | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `npm run dev`            | Start all apps in development/watch mode                |
| `npm run build`          | Build all apps and packages                             |
| `npm run lint`           | Lint all workspaces                                     |
| `npm run test`           | Run all tests (Vitest for UIs, Mocha for the backend)   |
| `npm run coverage`       | Run tests with coverage                                 |
| `npm run type-check`     | Type-check all workspaces                               |
| `npm run format`         | Format `*.ts`, `*.tsx` and `*.md` with Prettier         |
| `npm run clean`          | Remove build output from all workspaces                 |
| `npm run gen:workspace`  | Scaffold a new workspace with Turborepo                 |

To work on a single app you can also run its scripts directly, for example:

```sh
npm run dev   --workspace=backend
npm run build --workspace=frontend
```

## Production deployment

The application is deployed as three independent artefacts: a static frontend,
a static admin UI, and the Node backend. The Vite apps are served by Apache
(the `.htaccess` files live in each app's `public/` folder) and the backend runs
on a Node host with MongoDB.

### 1. Frontend (game)

1. Set the production API endpoint in `apps/frontend/.env.production`. It
   overrides `VITE_API_ENDPOINT` from `.env`:

   ```shell script
   VITE_API_ENDPOINT=https://<backend-host>/api/frontend
   ```

2. Build from the repository root:

   ```sh
   npm run build --workspace=frontend
   ```

3. Upload the contents of `apps/frontend/dist/` to the web root. The
   `public/.htaccess` is copied into the build output and handles:
   - HTTP → HTTPS redirect,
   - directory listing disabled,
   - SPA fallback so client-side routes resolve to `index.html`.

### 2. Admin

1. Set the production API endpoint in `apps/admin/.env.production`:

   ```shell script
   VITE_API_ENDPOINT=https://<backend-host>/api
   ```

2. Build:

   ```sh
   npm run build --workspace=admin
   ```

3. Upload `apps/admin/dist/` to its web root. The admin `public/.htaccess`
   additionally protects the folder with HTTP Basic auth backed by an
   `.htpasswd` file; see the [admin README](apps/admin/README.md#security) for
   how to create it.

### 3. Backend

1. Provide production environment variables on the host:
   - `APP_CONFIG` – JSON with the MongoDB connection (`mongo.hostString`,
     optional `mongo.user`, optional `mongo.db`),
   - `MONGO_PASSWORD` – password for the MongoDB user,
   - `MONGO_BACKEND_DEV_PASSWORD` – password for the dictionary dev connection,
   - `ADMIN_API_TOKEN` – bearer token required by every `/api/backend/*` route.
     If it is not set, those routes fail closed and return `401`,
   - `PORT` – optional, defaults to `3001`,
   - `NODE_ENV=production`.

2. Build:

   ```sh
   npm run build --workspace=backend
   ```

   The backend build uses `esbuild` to bundle `src/index.ts` into `dist/`
   (externalising `express`, `cors`, `mongoose`, `uuid`, `dotenv` and
   `http-status-codes`). The `postbuild` step writes a trimmed
   `dist/package.json` for the deployed bundle.

3. Deploy `dist/` and start it with Node (for example
   `node dist/index.js`). Install the externalised runtime dependencies in the
   deployment target, or run the build on the host.

> Note: the exact hosting accounts (domain, Node host, MongoDB plan) are
> operational details that are not encoded in this repository. The steps above
> describe what the checked-in configuration expects.

## Tech stack

- **Frontend (game):** React, React Router, TypeScript, Vite, SASS, Vitest
- **Admin:** React, React Router, Redux Toolkit / RTK Query, TypeScript, Vite,
  MUI
- **Backend:** NodeJS, Express, MongoDB, Mongoose, Mocha
- **Tooling:** Turborepo, npm workspaces, ESLint, Prettier

## Backend data

The backend uses MongoDB to store game information such as the dictionary.

- The Polish dictionary is stored in the database. There is a logger endpoint
  for unknown words which are stored in the database; at intervals those
  "unknown words" are reviewed and promoted into the dictionary using the admin
  page.
- English words are provided by the Frontend Masters API
  <https://words.dev-apis.com/word-of-the-day> and validated via
  <https://words.dev-apis.com/validate-word>.

## Roadmap

A few features are still to be developed. Below is the list divided by module.

### Admin

- ~Use RTK and QTK for API calls~ [Feature #15](https://github.com/LukaszGrela/master-word/issues/15)
- Show Unknown Words Stats widget - rechart driven [Feature #14](https://github.com/LukaszGrela/master-word/issues/14)
- ~Config route~ [Feature #16](https://github.com/LukaszGrela/master-word/issues/16)
- Update and improve dictionary word count widget [Feature #17](https://github.com/LukaszGrela/master-word/issues/17)
- Session review [Feature #19](https://github.com/LukaszGrela/master-word/issues/19)
- Archived games review [Feature #20](https://github.com/LukaszGrela/master-word/issues/20)
- Manage shared sessions [Feature #21](https://github.com/LukaszGrela/master-word/issues/21)

### Backend

- word count attached to the game session [Feature #17](https://github.com/LukaszGrela/master-word/issues/17)
- ~store last game elapsed time~ (for comparison of best times) [Feature #9](https://github.com/LukaszGrela/master-word/issues/9)
- Unknown Words Stats functionality [Feature #14](https://github.com/LukaszGrela/master-word/issues/14)
- ~Game session data in DB~ [Feature #19](https://github.com/LukaszGrela/master-word/issues/19)
- Archive game sessions in DB [Feature #20](https://github.com/LukaszGrela/master-word/issues/20)
- ~Config functionality~ [Feature #16](https://github.com/LukaszGrela/master-word/issues/16)
- measure transaction times and accumulate offset to adjust game time (so longer responses do not affect the game play time) [Feature #23](https://github.com/LukaszGrela/master-word/issues/23)
- shared game session [Feature #21](https://github.com/LukaszGrela/master-word/issues/21)

### Game

- display dictionary (word count) length [Feature #17](https://github.com/LukaszGrela/master-word/issues/17)
- ~show last game time comparison~ [Feature #9](https://github.com/LukaszGrela/master-word/issues/9)
- add some animations [Feature #18](https://github.com/LukaszGrela/master-word/issues/18)
- ~use config info~ [Feature #16](https://github.com/LukaszGrela/master-word/issues/16)
- share game - owner shares a link to the game for preview only [Feature #21](https://github.com/LukaszGrela/master-word/issues/21)
- save game - owner has access to the session of the game and can continue e.g. on another machine [Feature #22](https://github.com/LukaszGrela/master-word/issues/22)
- View previous games for current session [Feature #20](https://github.com/LukaszGrela/master-word/issues/20)
- Use timer offset - [Feature #23](https://github.com/LukaszGrela/master-word/issues/23)