# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`matchmediaquery` is a tiny isomorphic (client + server) implementation of `window.matchMedia`. It's a fork of `matchmedia`, published under a different name because the original author never published their latest version to npm.

The entire library is `index.js` (~60 lines). There is no build step or bundler — the published package is the raw source.

## Commands

- Run tests: `npm test` (runs `lab -vL`, using `@hapi/lab` as the test runner and `code` for assertions)
- Run a single test: tests are grouped with `lab.experiment`/`lab.test` in `test/index.js`; `@hapi/lab` doesn't support name-filtering via a simple flag the way Mocha does, so isolate a test by temporarily commenting out the other `lab.test(...)` blocks, or narrow the file passed to `lab` directly.
- Linting runs as part of `npm test` (the `-L` flag to `lab`), using the flat config in `eslint.config.js` (ESLint 9, required by `@hapi/lab` 26+; the legacy `.eslintrc` file is no longer read and is kept only for editor integration). Without `eslint.config.js`, `@hapi/lab` silently falls back to its bundled hapi style guide (4-space indent, `let`/`const`, arrow functions), which conflicts with this codebase's intentional ES5 style — don't delete it.
- Publish/release: pushing a `vX.Y.Z` tag triggers `.github/workflows/continuous-deployment.yml`, which runs tests then `npm publish`. Regular pushes/PRs to `main` run `.github/workflows/continuous-integration.yml` (install + test on Node 18).

## Architecture

`index.js` exports a single `matchMedia(query, values, forceStatic)` function that returns an `Mql` (fake `MediaQueryList`) instance:

- **Dynamic (browser) path**: if `window.matchMedia` exists and `forceStatic` is falsy, it delegates to the real `window.matchMedia`, mirrors `matches`/`media` from it, and wires the real MQL's `addListener`/`removeListener` to keep `this.matches`/`this.media` in sync via an internal `update` handler.
- **Static (server or forced) path**: if there's no `window.matchMedia`, or `forceStatic` is true, or the real `matchMedia` returned falsy (e.g. Firefox in a hidden iframe returns `null`), it falls back to `css-mediaquery`'s `match(query, values)` for a one-time synchronous evaluation. `addListener`/`removeListener`/`dispose` become no-ops in this path since there is nothing to subscribe to.
- `forceStatic` exists specifically so consumers can force server-style evaluation even when running in a browser (e.g. for testing, or SSR-consistent rendering).

Style note: the codebase intentionally uses `var`/ES5 (see `.eslintrc`: single quotes, required semicolons, `strict: global`) — match this style rather than introducing ES6+ syntax.
