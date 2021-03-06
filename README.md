# Analyze Properties

This repo contains a few projects:

- `src/extension` Chrome extension
- `src/ui` A UI component lib
- `src/web` A web app

Common components are kept in `/src/common`.

## Requirements

Node and yarn.

## Backend

This is a firebase project.  See `firebase.json` and `database.rules.json`.  Cloud functions are stubbed in `/functions`.

```
yarn firebase:backup  # backup firebase to /backups
yarn firebase:deploy  # deploy the web app
yarn firebase:login   # login to the CLI (required)
```

## Commands

Develop on an app:
```
yarn start            # starts the web app
yarn start:extension
yarn start:ui
```

Build an app:
```
yarn build            # builds the web app
yarn build:extension
yarn build:ui
```
