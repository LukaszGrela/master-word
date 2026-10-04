# @repo/backend-types

Shared backend types that are used across all apps (the Express backend, the
game frontend and the admin UI).

## Purpose

This package is a types-only workspace: it contains no runtime code and is
consumed through TypeScript imports. Keeping the backend's request/response and
domain types here means the frontend, admin and backend all describe the API in
the same way.

## Usage

Import types directly from the package name:

```ts
import type { TConfig } from '@repo/backend-types';
```

## Development

This package has no build or test scripts of its own. It is part of the
Turborepo workspace, so run checks from the repository root:

```sh
npm run type-check
npm run lint
```

Because the package publishes only type declarations, changes take effect
through the consuming workspaces' TypeScript compilation — there is no `dist/`
artefact to build or deploy.