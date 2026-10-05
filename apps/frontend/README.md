# Master Word — Frontend (game)

The player-facing game UI for Master Word. You have to guess a 5 letter word
within a limited number of attempts.

[Live Example - Master Word](https://master-word.greladesign.co/)

## Tech

React + TypeScript + Vite + Vitest + SASS

## Prerequisites

- Node.js `>=18` (the monorepo pins Node `20.5.1` and npm `9.8.0` via
  [Volta](http://volta.sh/)).
- Dependencies installed from the repository root with `npm install`.
- The backend running (see [../backend/README.md](../backend/README.md)) for the
  API calls the game makes.

## Run locally

From the repository root:

```sh
npm run dev --workspace=frontend
```

Or from this folder:

```sh
npm run dev
```

The local dev server runs on port `5273` (http://localhost:5273). The backend
CORS configuration allows this origin.

The API endpoint used during development comes from `.env`:

```shell script
VITE_API_ENDPOINT=http://localhost:3001/api/frontend
```

### Scripts

| Script                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the Vite dev server on port 5273       |
| `npm run build`        | Production build into `dist/`                |
| `npm run preview`      | Serve the production build locally           |
| `npm run type-check`   | Run `tsc`                                    |
| `npm run lint`         | Run ESLint                                   |
| `npm run test`         | Run Vitest once                              |
| `npm run test:watch`   | Run Vitest in watch mode                     |
| `npm run coverage`     | Run Vitest with coverage                     |
| `npm run clean`        | Remove `dist/`                               |

## Production

The `.env.production` file overrides the `.env` variable `VITE_API_ENDPOINT`
with the production backend URI:

```shell script
VITE_API_ENDPOINT=https://<backend-host>/api/frontend
```

Build and deploy:

```sh
# from the repository root
npm run build --workspace=frontend
```

Upload the contents of `apps/frontend/dist/` to the static web root. The
`public/.htaccess` file is copied into the build output and configures Apache to:

- redirect HTTP to HTTPS,
- disable directory listings,
- fall back to `index.html` so client-side routes work (SPA rewrite).

Because this is a static build, the web server only needs to serve files — no
Node runtime is required for the frontend.