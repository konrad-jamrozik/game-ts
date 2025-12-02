# Prompts for AI agents

This file has experimental prompts for AI agents.

Copy-paste contents of each section as instructions for an AI agent.

# Convert the game to Unity

Write a plan for converting the game from current React-based web app to Unity engine.
The game won't have any fancy graphics, just a a replication of the 2D UI.

# Add 3D Globe

Write a plan for adding a 3D, rotating globe of planet Earth to the game.
Choose a good library for rendering such a globe.

## Internal notes re 3D globe

One example: https://cesium.com/platform/cesiumjs/

# Make the game interface be composed of multiple screens, tabbed

Write a plan to reorganize the web UI so it is composed of multiple screens (pages),
each accessible via a tab from a tab bar on the left side of the screen.

When a player clicks on the tab, the URL of the app should be updated, but it should not reload the page.
The app should still remain fully a client-side app, without any reload from the server.

There should be following tabs:

- Situation room
  - Has primary game controls like advance turn, undo, redo, reset turn, reset game, wipe storage & reload.
  - Provides overview of key information like:
    - Current turn
    - Assets available, including money, intel
    - Situation report, including panic, factions
    - Overview of Missions, Leads, Agents
- Agents
  - Provides detailed information about agents
  - Allows managing agents: hiring, sacking, assigning, recalling, etc.
- Leads
  - Provides detailed information about leads and lead investigations
  - Allows managing leads: assigning agents to them, recalling agents from them, etc.
- Missions
- Assets
  - Provides detailed breakdown of assets available
  - Provides key information on capabilities and ability to purchase more
- Turn report
  - Provides detailed report of what changed when turn was advanced to current turn
- Ufopaedia
  - Provides detailed information about the discovered information, this includes:
    - Tutorials for the player about the game mechanics
    - Deep dives into various game mechanics.
    - In-game lore information discovered from the leads and other sources.
- Archive
  - Provides historical charts how things changed over turn, including information like:
    - Money, intel, agents, leads, missions, etc.

# Write an AI player and interface for it

Write a plan how to add "AI Player" feature to the game.

Key components of it:

- A user can choose an "AI player intellect" from a dropdown, and click "Delegate to AI" button,
  that makes the AI player execute player actions on player's behalf, and advance turn on player's behalf.
- A scaffolding & interface for an "AI player", that can:
  - read game state to get the same information as human player would,
  - execute player actions and other reducers, like a human player could.
  - load an "AI player intellect" that reads the game state and executes the player actions and advances turn
    based on its implementation.
- The implementation of at least one "AI player intellect", that can successfully play and win the game.
  - Such AI player intellect should be able to:
    - Have the basic capability to read game state and act on it, as described above.
    - Make good decision about:
      - agents: when to fire, hire, what to assign them to, including
        lead investigations and mission deployments.
      - Which lead to investigate, which mission to deploy agents to, how much, and so on.
      - Which capabilities to upgrade and when.
      - Which factions to focus on, to suppress them enough so panic doesn't reach 100% and thus game ends.
