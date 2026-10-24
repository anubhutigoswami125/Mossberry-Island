# Technical Architecture

## Chosen stack
- Phaser 3 for 2D browser rendering and TypeScript definitions; MIT licensed.
- TypeScript with strict checking.
- Vite for local development and static production builds.
- Vitest for deterministic unit tests.
- Browser localStorage for initial single-player saves.
- GitHub Actions and GitHub Pages for static deployment.

## Boundaries
- src/main.ts: initial composition root, Phaser scene, DOM interface wiring.
- src/systems/state.ts: deterministic inventory and clock rules.
- src/systems/save.ts: save schema, validation, load and write.
- src/style.css: presentation.
- docs/: design and implementation contracts.

As the project grows, split the scene and UI into modules and move content into typed data files. Keep one authoritative GameSave model.

## Time model
One real second advances one in-game minute. An in-game day is 24 real minutes. Clock begins at 08:00 on Day 1. Browser suspension pauses updates; offline catch-up is not currently applied.

## Save model
Save has an explicit version and validates shape and ranges. Invalid saves are backed up under a recovery key before the primary key is removed. Cloud saves are a future concern.

## Deployment and AI security
Vite base path is /Mossberry-Island/. GitHub Pages only serves static files and cannot keep a Groq secret private. Any future AI endpoint must use a separate server runtime, environment secrets, validation, rate limits, and deterministic game-side reward validation.

## Known risks
Collision is simple circle-based blocking, not a tilemap. Collection currently refreshes the scene as a prototype shortcut. Save writes use synchronous localStorage. Browser-level tests are not yet configured.
