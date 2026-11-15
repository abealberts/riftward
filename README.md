# Riftward
A mobile-friendly, turn-based monster expedition RPG. All twelve creatures and the citadel landscape use original pixel artwork.

## Play
Open Home and launch The Hollow Spire, or visit Party to change your formation. Select a fighter, then a destination slot to place or swap it. Missions require nine occupied slots. The Collection shows detailed attributes and skills.

Choose three disjoint lines across the formation. Horizontal rows and wraparound diagonals each form a set of three. Your line order controls attack priority, with agility breaking order within a line. Living fighters repeat the sequence until one side falls. Each surviving enemy retaliates after a strike. Speed controls and Skip playback let you inspect or advance the log.

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
