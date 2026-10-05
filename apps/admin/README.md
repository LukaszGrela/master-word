# Master Word Admin

Admin UI for the Master Word backend. It manages the dictionary and the
application configuration through the `/api/backend/*` endpoints.

## Tech

React + TypeScript + Vite + Redux Toolkit (RTK Query) + MUI + SASS

## Prerequisites

- Node.js `>=18` (the monorepo pins Node `20.5.1` and npm `9.8.0` via
  [Volta](http://volta.sh/)).
- Dependencies installed from the repository root with `npm install`.
- The backend running (see [../backend/README.md](../backend/README.md)). The
  admin routes are protected by `ADMIN_API_TOKEN`.

## Run locally

From the repository root:

```sh
npm run dev --workspace=admin
```

Or from this folder:

```sh
npm run dev
```

The local dev server runs on port `5274` (http://localhost:5274). The backend
CORS configuration allows this origin.

The API endpoint used during development comes from `.env`:

```shell script
VITE_API_ENDPOINT=http://localhost:3001/api
```

### Scripts

| Script               | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start the Vite dev server on port 5274     |
| `npm run build`      | Production build into `dist/`              |
| `npm run preview`    | Serve the production build locally         |
| `npm run type-check` | Run `tsc`                                  |
| `npm run lint`       | Run ESLint                                 |
| `npm run clean`      | Remove `dist/`                             |

## Production

The `.env.production` file overrides the `.env` variable `VITE_API_ENDPOINT`
with the production backend URI:

```shell script
VITE_API_ENDPOINT=https://<backend-host>/api
```

Build and deploy:

```sh
# from the repository root
npm run build --workspace=admin
```

Upload the contents of `apps/admin/dist/` to its static web root. The
`public/.htaccess` file is copied into the build output and configures Apache to:

- redirect HTTP to HTTPS,
- disable directory listings,
- fall back to `index.html` so client-side routes work (SPA rewrite),
- require HTTP Basic auth for the whole folder (see [Security](#security)).

The admin backend API additionally requires the `ADMIN_API_TOKEN` bearer token
configured on the server. Without it, `/api/backend/*` requests return `401`.

## Security

The Admin app is additionally protected at the web-server level. The Apache
`.htaccess` in `public/` contains:

```
AuthType Basic
AuthName "Master Word Admin"
AuthUserFile ../.htpasswd
require valid-user
```

It references an `.htpasswd` file holding the valid user name and password.
Create it with `htpasswd`:

```sh
htpasswd -c /path/where/to/store/.htpasswd user.name
# then enter a password
# -c means Create a new file
```

Alternatively generate the password hash with OpenSSL:

```CLI
    openssl passwd -apr1 your_password
```

Then put the generated password into `.htpasswd` in the format
`<user_name>:<generated_password>`, for example:

```
   user.name:$apr1$ydbofBYx$6Zwbml/Poyb61IrWt6cxu0
```

Put the `.htpasswd` file outside of the protected folder (or anywhere, but
adjust the `AuthUserFile` path in `.htaccess` accordingly).

## Redux Toolkit Query

There is a problem with exporting hooks from `createApi` in version 2.x, so the
project is pinned to `1.9.7`:

```
The inferred type of 'useGetUnknownWordsQuery' cannot be named without a reference to '@reduxjs/toolkit/dist/query/react/buildHooks'. This is likely not portable.
```