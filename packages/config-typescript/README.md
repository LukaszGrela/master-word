# @repo/config-typescript

Shared TypeScript configuration for the Master Word monorepo.

## Purpose

Centralising `tsconfig` settings keeps compiler options consistent across the
frontend, admin and backend apps. Workspaces extend these base files instead of
duplicating options.

## Contents

The package provides the shared `tsconfig` files that the apps extend, for
example:

```json
{
  "extends": "@repo/config-typescript/..."
}
```

Check the individual `tsconfig.json` files under `apps/*` for the exact extends
path currently used.

## Development

This package has no build, lint or test scripts of its own. It is part of the
Turborepo workspace, so run checks from the repository root:

```sh
npm run type-check
npm run lint
```

Changes here affect every workspace that extends the configuration. Run the
root `type-check` and `lint` after editing to catch breakage across apps.