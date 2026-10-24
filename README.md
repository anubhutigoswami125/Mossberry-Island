# Mossberry Island

*A little life, growing quietly.*

An original cozy browser life-simulation in active development. The first playable slice begins in the North Meadow: walk around, meet Rowan Thistle, gather small finds, explore your cottage, and save your progress.

## Controls
- Move: WASD or arrow keys
- Interact: E when near an object or resident
- Mouse: click a nearby point of interest
- Save: use “Save quietly”; the game also autosaves

## Local development
Requirements: Node.js 22.12+ and npm.

    npm install
    npm run dev
    npm test
    npm run build
    npm run preview

## Current milestone
The early vertical slice includes one outdoor area, player movement, three collectible objects, one resident with authored dialogue, an inventory, a shared simulation clock, and versioned local saves. Art is original code-drawn prototype art, not final sprite art. Collision and touch controls need further refinement.

## Architecture
- Phaser 3 + TypeScript for the 2D world and game logic.
- Vite for development and static builds.
- Vitest for deterministic rule tests.
- Browser local storage for the initial single-player save.
- No AI API is required to play. GitHub Pages cannot securely host a private Groq key.

## Documentation
See AGENTS.md, docs/GAME_DESIGN.md, docs/WORLD_BIBLE.md, docs/TECHNICAL_ARCHITECTURE.md, docs/CONTENT_SCHEMA.md, docs/ASSET_GUIDE.md, docs/TESTING.md, docs/ROADMAP.md, and CHANGELOG.md.

## Deployment
The Vite build uses /Mossberry-Island/ as its base path. GitHub Pages must deploy the dist output through GitHub Actions. No server-side AI service is included yet.

## License
Original project code is licensed under MIT. Third-party frameworks retain their own licenses. See LICENSE.
