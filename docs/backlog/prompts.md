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
- The UI allowing the human player to invoke the API player
- The implementation of the AI player interface to the rest of the app
- The implementation of the AI player intellects

## The UI for AI player

In "Game controls" component, add another section at the bottom, "AI player", with following elements:

- A dropdown to choose "AI player intellect"
- A button "Delegate to AI" that makes the AI player execute all the actions it wants to execute
  in the given turn according to the chosen intellect, and then advances the turn,
  if possible (it won't be possible is game is over).

## The AI player API

The AI player API is as follows:
- It is implemented in web/src/lib/ai/
- When a player clicks "Delegate to AI" it is routed to function that obtains appropriate `AIPlayerIntellect` from the `intellectRegistry`
  and launches `playTurn` function. That function can be called `delegateTurnToAIPlayer`.
- The `playTurn` function is implemented within the intellect itself, according to the `AIPlayerIntellect` type.
- The `playTurn` functions allows the intellect implementing it to repeatedly inspect current turn `gameState`, and invoke all the same
  actions a human player could invoke, read the updated `gameState`, and repeat until the intellect decides it doesn't want to do anything else
  in the turn and returns.
- Then the control comes back to `delegateTurnToAIPlayer` function which advances the game turn, if possible (i.e. it is not game over).

## The AI player intellects

Two intellects at first:

- "Do nothing" intellect, that always just advances the turn, that's it.
- "Basic" intellect, as described below.

### Basic intellect

The "basic" AI player intellect should be able to:
- Have the basic capability to read game state and act on it, as described above.
- Make good decision about:
  - agents: when to fire, hire, what to assign them to, including
    lead investigations, training, and mission deployments.
  - Which lead to investigate, which mission to deploy agents to, how much, and so on.
  - Which capabilities to upgrade and when.
  - Which factions to focus on, to suppress them enough so panic doesn't reach 100% and thus game ends.
