# Riftward
A mobile-friendly, turn-based monster expedition RPG. All 28 creatures and the citadel landscape use original pixel artwork.

## Play
Open Home, choose Missions, and launch The Hollow Spire, or visit Party to change your formation. Select a fighter, then a destination slot to place or swap it. Missions require nine occupied slots. The Collection shows detailed attributes and skills.

Swipe three different straight lines across the formation using touch or mouse. Each row and both corner-to-corner diagonals can be traced in either direction. Intersecting fighters act on each selected line, in descending AGI order across the entire turn. The third swipe starts playback in the arena. Fighters focus the first standing enemy. Each line reserves one enemy action, also ordered by AGI. Defeated actors lose queued actions. Equal speeds resolve by line and swipe order. Encounters field one, two, then three enemies. If both sides survive, choose the next turn to save the updated HP and queue three fresh lines. Button controls, adjustable speed, and the battle log are available below the arena.

HP carries across the three encounters. Every encounter victory credits account XP and XP for each party member. The victory screen shows those rewards and the final encounter also pays mission shards. Every 40 XP grants a level. Cleared missions can be replayed. Each new expedition restores the party's HP.

## Development
Use Node.js 22.12+ and npm.

    npm ci
    npm run dev
    npm test
    npm run build

Vite prints the development URL. The production build is in dist/. Serve via HTTP. Versioned localStorage records formation, instance IDs, experience, shards, clears, and the active encounter checkpoint. Refreshing during playback restarts that encounter with the same seed. Reset save in the footer clears campaign progress.

## GitHub Pages
In Settings → Pages, choose GitHub Actions. Push to main or manually run “Test and deploy Riftward”. The workflow installs locked dependencies, runs Vitest, type-checks, builds and deploys dist/. Relative asset paths support repository subdirectory hosting.

## Summoning
The Summoning screen opens from Home and offers one summon for 40 earned shards. Rarity odds are 65% Common, 25% Rare, 8% Epic and 2% Legendary. Species within a tier are equally likely. Duplicate pulls create separate level-one fighters. The 12 original fighters start as Common. The pool adds eight Rare, five Epic and three Legendary species.
