# @repo/utils

Small helper functions shared across the Master Word apps.

## Purpose

This package holds framework-agnostic utilities used by more than one
workspace, so the same logic does not have to be copied into the frontend,
admin and backend.

## Usage

Import helpers from the package name:

```ts
import { someHelper } from '@repo/utils';
```

## Development

Run the package's own checks from its folder:

```sh
npm run type-check
npm run lint
```

Or run all workspace checks from the repository root:

```sh
npm run type-check
npm run lint
```

The backend bundles this package into its `esbuild` output (see
[apps/backend/README.md](../../apps/backend/README.md#turborepo)), so no separate
build or deploy step is required for the utilities themselves.