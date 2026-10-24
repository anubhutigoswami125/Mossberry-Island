# Testing Strategy

## Automated unit tests
Run npm test. The initial suite covers inventory add/remove invariants, day rollover, and basic save validation.

## Production build
Run npm run build. TypeScript checking is part of the build.

## Manual vertical-slice checklist
- [ ] Meadow renders and movement stays inside the scene.
- [ ] Collect each of the three objects; inventory updates once per object.
- [ ] Reload and confirm inventory and discoveries persist.
- [ ] Meet Rowan; authored dialogue opens and closes.
- [ ] Give Rowan a berry only when one exists; one berry is removed and friendship increases by two.
- [ ] Interact with the cottage and add a journal note.
- [ ] Confirm clock advances and rolls from 11:59 PM to the next day.
- [ ] Manual save and reload preserve position, inventory, day, discoveries, and memories.
- [ ] Test narrow viewport and keyboard focus.

## Status honesty
Tests are authored but are not considered passed until run in a Node/npm environment. No Playwright browser tests are included yet.
