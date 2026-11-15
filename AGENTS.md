# Project conventions
Use React, TypeScript and plain CSS. Keep fighter and mission definitions in src/data.ts. Keep combat pure in src/engine.ts and progression and serialization in src/save.ts. Combat randomness must derive from the supplied seed. Reference owned fighters by instance ID. Keep saves versioned and add a migration when changing the schema. Use original art under public/art.

Run npm ci on a fresh checkout. Run npm test and npm run build before pushing. Use npm run dev for interactive checks. Keep Pages paths relative. Test progression through all three encounters when changing battle balance.
