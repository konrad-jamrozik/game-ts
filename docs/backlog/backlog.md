# Backlog

KJA backlog:

# P0 Game mechanics

- Funding penalty for expired missions

- Win criteria - defeat all enemy factions
  - Raiding each HQ should unlock new lead
  - Unlocking all HQ raids leads should unlock the final "game victory" lead
  - Researching that lead should win the game.

# P1 Game mechanics

- Add AI player that can play the game for me

- Enemy factions should generate missions themselves that player must counter to avoid penalties
  - Offensive missions like "Red dawn terror" or "Red dawn assault" where someone called for help

- Make each repeatable lead be investigated only once at a time.
  - Make even allow one lead per faction at a time.

- Interrogating captured enemies should provide bonus towards various lead investigations.
  - Intel lump sum.
  - What if there is currently no eligible lead investigation?
    - Maybe decrease lead difficulty by some amount?

- Accumulated generic intel ideas:
  - Spend to discover enemy offensive missions faster
  - Spend to reveal more details about existing mission sites
  - Spend to give combat bonus to player's agents on missions
  - It decays same as lead investigation intel
- See also `2025-11-19 Intel ideas`

- Change lead investigation intel formula:
  - Difficulty says how much intel must be accumulated, but actual length is 50% to 200% of that.
  - Accumulated intel does not decay.
    - I was considering saying that "Intel does not decay as long as at least 1/4 of the accumulated intel is
    being accumulated per turn. So if in total 300 intel was accumulated, then as long as at least
    75 extra intel is accumulated per turn, there is no intel decay".
    But this would mean that each lead must be investigated in 4 turns, or decay.
    E.g. 1000 intel must be accumulated. So decay will happen if less than 1000/4 =250 intel per turn
    is accumulated.
  - As agents accumulate intel per turn, the more agents are accumulating it at once, the less effective
    each agent is. This motivates the player to have multiple lead investigations at once, to maximize
    the overall intel accumulated.
    - E.g. `Intel_accumulated_per_turn = Sum(agent_skills) * (no_of_agents ^ 0.9)`
    - Note: I rejected a design where e.g.:
      `Intel_accumulated_per_turn = Sum(agent_skills) * (no_of_agents * (100% - 2% * (no_of_agent - 1)))`
      because it leads o a situation where beyond some point, adding more agents causes _less_
      intel to be accumulated. E.g. if no_of_agents is 51 then total intel accumulated is 100-100% = 0%!.
      For details, see https://chatgpt.com/share/693626cb-03e4-8011-98de-32d9a95abf66
    - E.g. using the proposed formula with exponent `^ 0.8`:
       (see https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/69362838-c168-8328-96c0-0fbb72211c97)
        1 agent  :  100%, 100% per agent
        2 agents :  174%,  87% per agent
        3 agents :  240%,  80% per agent
        4 agents :  303%,  75% per agent
        5 agents :  362%,  72% per agent
        6 agents :  419%,  69% per agent
        7 agents :  474%,  67% per agent
        8 agents :  527%,  65% per agent
        9 agents :  579%,  64% per agent
       10 agents :  630%,  63% per agent
       15 agents :  872%,  58% per agent
       20 agents : 1098%,  54% per agent
       25 agents : 1313%,  52% per agent
       30 agents : 1519%,  50% per agent
       40 agents : 1912%,  47% per agent
       50 agents : 2286%,  45% per agent
       60 agents : 2645%,  44% per agent
       70 agents : 2992%,  42% per agent
       80 agents : 3330%,  41% per agent
       90 agents : 3659%,  40% per agent
      100 agents : 3981%,  39% per agent
    - Note that because penalty is per agent, it is cumulative. So 2 agents will accumulate at 190% of 1 agent,
      not at 95% of 2 agents.

# P0 UI refinement

- Add "Details" button to completed missions that show the combat log
- For combat reports, add dedicated data grid with columns same as console.log i.e.:
  - round
  - attacker & effective skill & % of initial
  - defender & effective skill & % of initial
  - roll & result & threshold & diff to threshold
  - damage inflicted (if any) & % of weapon range & min & max
  - hit points remaining & percentage of total & total

- Add to assets: Agent weapon damage range min-max
  - make buying training skill gain and health recov. % fractional

# P1 UI refinement

- Apply skill, exhaustion and HP styling with colorful bar from: https://mui.com/x/react-data-grid/style/#styling-rows

- Add stats
  - Combat stats (Killed / Damage Inflicted / Damage Taken)
    - Column names: "Kills", "Damage", "Wounds"
  - Skill: Total / from missions / from training
    - Colum name: "Skill (Mis/Trn)"

# P2 UI refinement

- Charts for stats over time, at the bottom of the screen.
  - Panic
  - Each faction threat level, suppression, panic increase
  - Money
  - Cumulative missions completed successfully, failed, expired
  - Hardest mission completed by total enemy skill
  - Agents, and what they do: contracting, investigating leads, on missions, etc.
  - Agent skill: min, average, median (top 50%, 50th percentile), top 10% (90th percentile), max

# P0 Game content

- Add more factions

# Domain model refactoring

- instead of the idiom `"leadInvestigationCounts[lead.id] ?? 0"` and `getLeadById(leadId)`
  do it the same way as `agentUtils`
  - `withId(id: string): Lead`
  - `isInvestigated(id: string): boolean`
  - `getInvestigationCount(id: string): number`
  - Replace idioms like `leadInvestigationCounts[lead.id] ?? 0`
  - Replace `getLeadById(leadId)` calls
  - Update selectors
- hierarchize the game state per the comments and use more fine-grained selectors.
  `export type GameState = {`
  - Log (turn counter, action tracking)
  - Situation (panic, faction threats, active missions, deployed missions)
  - Assets (money, intel, agents)
  - Archive (events, mission results)
- all cases of usage of `assertDefined` should be allowed only inside domain model collections.
  Because all other places should not return undefined, so no need to use it.
  In case of finding single item, it will basically become dotnet .Single()

# Docs

- document the lead investigation mechanics: intel accumulation, difficulty, decay, rolling for success.
  Clarify that decays grows super-linearly to disincentivize piling all agents into one lead, and thus
  introducing a trade-off. Read more in OneNote for MLS4 intel page.
- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs

# Tests

- Address all 🚧 TODOS, except "not implemented yet", in [about_test_suite.md](../design/about_test_suite.md)
- In tests, need a helper that does both `expect(X).toDefined()` and `assertDefined(X)`

# UI improvements

# Performance Optimizations

- performance clue from dev console:
  // eventsMiddleware.ts:49 ImmutableStateInvariantMiddleware took 68ms, which is more than the warning threshold of 32ms.
  // If your state or actions are very large, you may want to disable the middleware as it might cause too much
  of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
  // It is disabled in production builds, so you don't need to worry about that.
  - Analyze state size and complexity
  - Configure middleware threshold or disable for large operations
  - Add conditional middleware configuration  
- on npm run build
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ✓ built in 6.66s
    - Analyze bundle with `npm run build --analyze`
    - Focus on optimizing bundle with tree shaking
    - Configure manual chunks in Vite config for better caching
    - Accept larger initial bundle size (load everything at once)
    - No dynamic imports or lazy loading needed

# Dev exp

- Add ESLint server MCP: https://eslint.org/docs/latest/use/mcp

# Maybe, future

- See `prompts.md` and `.cursor/plans` for more ideas.

- Allow State column filtering:
  Per LLM, how to make MUI use enum for filtering:
  > In MUI, when I have column menu for filtering, can I make it so that it allows me to pick from multiple predefined
  > values? An enumeration
  >
  > "Solution: Use singleSelect Type with valueOptions"
  ``` typescript
  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['Active', 'Inactive', 'Pending', 'Completed'],
      width: 150,
    },  
  ```
