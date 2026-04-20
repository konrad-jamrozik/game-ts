---
name: ai intellect implementation guide
overview: "Author a new doc `docs/ai/about_ai_player_intellect.md` — a generic guide for implementing an AI player intellect. Core focus: the interfaces an intellect has available (`AIPlayerIntellect`, `PlayTurnAPI`, `ActionResult`) and the control flow between the game engine and the intellect (delegation, per-turn callback, action dispatch, state refresh, turn advancement)."
todos:
  - id: draft-doc
    content: Write docs/ai/about_ai_player_intellect.md following the structure in the plan (intro, AIPlayerIntellect contract, registry, PlayTurnAPI walkthrough, control-flow section with mermaid sequence diagram, author invariants, step-by-step recipe, See also)
    status: completed
  - id: cross-link
    content: Add a one-line pointer to the new doc from docs/ai/about_basic_intellect.md so readers discover the generic guide
    status: completed
  - id: verify
    content: Run oxlint / qcheck per AGENTS.md; verify all markdown links resolve
    status: completed
isProject: false
---

## Target file

Create [docs/ai/about_ai_player_intellect.md](docs/ai/about_ai_player_intellect.md). Keep it generic (not tied to `basicIntellect`). Cross-link the existing basic-intellect docs at the bottom.

## Document structure

1. **Introduction** — what an "intellect" is: a pluggable strategy object that plays one or more turns on behalf of the player. Registered by string name in [web/src/ai/intellectRegistry.ts](web/src/ai/intellectRegistry.ts). Two reference implementations ship today: `doNothingIntellect` and `basicIntellect`.

2. **The `AIPlayerIntellect` contract** — the minimal surface every intellect must implement, from [web/src/ai/types.ts](web/src/ai/types.ts):

   ```ts
   export type AIPlayerIntellect = {
     name: string
     playTurn(api: PlayTurnAPI): void
   }
   ```

   Explain: `playTurn` is synchronous, runs inside one turn, does not advance the turn itself, and must use `api` for every state mutation.

3. **Registering a new intellect** — describe the map in [web/src/ai/intellectRegistry.ts](web/src/ai/intellectRegistry.ts) and how `getIntellect(name)` / `getAllIntellectNames()` expose it to UI and tests.

4. **The `PlayTurnAPI` interface (the intellect's only input/output surface)** — full walkthrough of [web/src/lib/model_utils/playTurnApiTypes.ts](web/src/lib/model_utils/playTurnApiTypes.ts). Two categories:
   - **Read-only state snapshots**: `gameState: GameState`, `aiState: BasicIntellectState`, plus `updateCachedGameState()` (explain why it exists — the cached snapshot refreshes automatically after every successful action, but this lets callers force a refresh).
   - **Player actions** (each returns `ActionResult` from [web/src/lib/model_utils/playerActionsApiTypes.ts](web/src/lib/model_utils/playerActionsApiTypes.ts)):
     - `hireAgent()`, `sackAgents(agentIds)`
     - `assignAgentsToContracting(agentIds)`, `assignAgentsToTraining(agentIds)`, `recallAgents(agentIds)`
     - `startLeadInvestigation({leadId, agentIds})`, `addAgentsToInvestigation({investigationId, agentIds})`
     - `deployAgentsToMission({missionId, agentIds})`
     - `buyUpgrade(upgradeName)`
   - Include `ActionResult` shape and the "fail fast vs. fail gracefully" note — intellects should treat `success: false` as a bug signal per AGENTS.md (this matches the `strict: true` flag passed in [web/src/ai/delegateTurnsToAIPlayer.ts](web/src/ai/delegateTurnsToAIPlayer.ts)).

5. **Control flow between engine and intellect** — the heart of the doc. Explain the two entry points:
   - `delegateTurnToAIPlayer(name)` — single turn.
   - `delegateTurnsToAIPlayer(name, turnCount)` — loop that respects `selection.autoAdvanceTurn` and `isGameEnded`.

   Walk through [web/src/ai/delegateTurnsToAIPlayer.ts](web/src/ai/delegateTurnsToAIPlayer.ts) step by step:
   1. UI/test code invokes `delegateTurnsToAIPlayer` (or a single-turn variant).
   2. Engine builds a fresh `PlayTurnAPI` via `getPlayTurnApi(store, { strict: true })` from [web/src/redux/playTurnApi.ts](web/src/redux/playTurnApi.ts), which snapshots `gameState` and `aiState` from the Redux store.
   3. Engine calls `intellect.playTurn(api)` and hands control to the intellect.
   4. Intellect issues zero or more actions via `api.*`. Each action dispatches to the Redux store via `getPlayerActionsApi`, and on success, `api.gameState` / `api.aiState` are replaced with a fresh snapshot (see `updateGameState()` closure).
   5. Intellect returns. Engine dispatches `advanceTurn()` if `autoAdvanceTurn` is on (otherwise the outer loop dispatches it), advancing the simulation per [docs/design/about_turn_advancement.md](docs/design/about_turn_advancement.md).
   6. Engine marks a turn boundary in the profiler and loops to the next turn, short-circuiting when `isGameEnded(state)`.

   Include a mermaid sequence diagram showing the hand-off:

   ```mermaid
   sequenceDiagram
       participant Caller as UI / Test
       participant Engine as delegateTurnsToAIPlayer
       participant Registry as intellectRegistry
       participant Api as PlayTurnAPI
       participant Store as Redux store
       participant Intellect as intellect.playTurn

       Caller->>Engine: delegateTurnsToAIPlayer(name, N)
       loop N turns (until game ends)
           Engine->>Store: getCurrentTurnStateFromStore
           Engine->>Registry: getIntellect(name)
           Engine->>Api: getPlayTurnApi(store, strict)
           Engine->>Intellect: playTurn(api)
           loop zero or more actions
               Intellect->>Api: e.g. api.hireAgent
               Api->>Store: dispatch player action
               Store-->>Api: new state
               Api->>Api: refresh gameState, aiState
               Api-->>Intellect: ActionResult
           end
           Intellect-->>Engine: return
           Engine->>Store: dispatch advanceTurn
       end
   ```

6. **Invariants and rules for intellect authors** — a short checklist:
   - Never read state directly from the Redux store; only use `api.gameState` / `api.aiState`.
   - After each action, the snapshot is already refreshed; do not keep stale references to collections from before the call.
   - Do not dispatch `advanceTurn` yourself; the engine owns turn advancement.
   - Respect "fail fast": treat `ActionResult.success === false` as a bug.
   - Follow the dependency rules from [docs/design/about_code_dependencies.md](docs/design/about_code_dependencies.md): `ai/` may import from `redux/playTurnApi` and `lib/*` but not from `components/` or `redux/` internals.

7. **How to author a new intellect (step-by-step)** — concrete recipe:
   1. Create `web/src/ai/intellects/<name>Intellect.ts` exporting a `const myIntellect: AIPlayerIntellect`.
   2. Implement `playTurn(api)` using only the `PlayTurnAPI` surface.
   3. Register it in [web/src/ai/intellectRegistry.ts](web/src/ai/intellectRegistry.ts).
   4. Add a unit test under `web/test/ai/` modeled on [web/test/ai/basicIntellect.test.ts](web/test/ai/basicIntellect.test.ts).
   5. Run `qcheck` per AGENTS.md.

8. **See also** — link to:
   - [docs/ai/about_basic_intellect.md](docs/ai/about_basic_intellect.md)
   - [docs/ai/about_basic_intellect_lead_investigations.md](docs/ai/about_basic_intellect_lead_investigations.md)
   - [docs/ai/about_basic_intellect_purchasing.md](docs/ai/about_basic_intellect_purchasing.md)
   - [docs/design/about_turn_advancement.md](docs/design/about_turn_advancement.md)
   - [docs/design/about_code_dependencies.md](docs/design/about_code_dependencies.md)

## Out of scope (explicitly called out in the doc)

- Intellect-specific strategy, heuristics, tuning constants — those belong to `about_basic_intellect*.md`.
- UI wiring (`Delegate to AI` buttons, selection slice options) — documented elsewhere.
- `GameState` / `BasicIntellectState` field-level details — referenced by link, not duplicated.

## Editorial notes

- No emojis.
- No markdown tables per plan guidelines (use bullet lists; code blocks for type signatures).
- Follow existing `docs/` tone: "About X" style headings, third-person, imperative for instructions.
