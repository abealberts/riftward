# Riftward
A mobile-friendly, turn-based monster expedition RPG. All twelve creatures and the citadel landscape use original pixel artwork.

## Play
Open Home and launch The Hollow Spire, or visit Party to change your formation. Select a fighter, then a destination slot to place or swap it. Missions require nine occupied slots. The Collection shows detailed attributes and skills.

Swipe three different straight lines across the formation using touch or mouse. Each row and both corner-to-corner diagonals can be traced in either direction. Intersecting fighters act on each selected line, in swipe order. The third swipe starts playback in the arena. Enemies retaliate against living members of the active line. If both sides survive, choose the next turn to save the updated HP and queue three fresh lines. Button controls, adjustable speed, and the battle log are available below the arena.

HP carries across the three encounters. Claim rewards after the third victory to gain shards, account XP and XP for each party member. Every 40 XP grants a level. Cleared missions can be replayed. Each new expedition restores the party's HP.

## Development
Use Node.js 22.12+ and npm.

    npm ci
    npm run dev
    npm test
    npm run build

Vite prints the development URL. The production build is in dist/. Serve via HTTP. Versioned localStorage records formation, instance IDs, experience, shards, clears, and the active encounter checkpoint. Refreshing during playback restarts that encounter with the same seed. Reset save in the footer clears campaign progress.

## GitHub Pages
In Settings → Pages, choose GitHub Actions. Push to main or manually run “Test and deploy Riftward”. The workflow installs locked dependencies, runs Vitest, type-checks, builds and deploys dist/. Relative asset paths support repository subdirectory hosting.
