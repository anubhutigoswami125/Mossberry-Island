# Content Schema

## Save schema v1
GameSave contains version 1, day, minuteOfDay (0–1439), player coordinates, inventory quantities, discovery IDs, memory IDs, and friendship values.

## Planned item definition
Each item should have a stable ID, name, description, category, stackability, optional sell price, and tags.

## Planned NPC definition
Each NPC should have a stable ID, name, role, home location, personality traits, likes/dislikes, a schedule of minute ranges and locations, and dialogue variants.

## Planned memory record
Use structured records with stable ID, character ID, event type, summary, in-game day, and importance. Dialogue may refer only to memories and world facts available to that character.
