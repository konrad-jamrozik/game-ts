/**
 * Standalone AI profiling script.
 *
 * This script runs the AI directly without Vitest, enabling accurate CPU profiling.
 *
 * Usage:
 *   cd web
 *   npx tsx --cpu-prof scripts/profileAi.ts
 *   npx tsx --cpu-prof --cpu-prof-interval=250 scripts/profileAi.ts
 *
 * Then load the generated .cpuprofile file in Chrome DevTools → Performance tab.
 * The profiler CSV output is written to profile-results.csv.
 */
// @ts-expect-error - node:fs works at runtime with tsx but isn't in tsconfig.app.json
import { writeFileSync } from 'node:fs'
import { initStore, getStore } from '../src/redux/store'
import { delegateTurnsToAIPlayer } from '../src/ai/delegateTurnsToAIPlayer'
import { profiler } from '../src/lib/primitives/profiler'
import { getCurrentTurnStateFromStore } from '../src/redux/storeUtils'
import { setupCheatingGameState } from '../test/utils/aiTestSetup'

const TURNS_TO_PLAY = 200

async function main(): Promise<void> {
  console.log('Initializing store...')
  await initStore({ undoLimit: 0, enablePersistence: false })
  setupCheatingGameState()
  const store = getStore()

  // Enable profiler
  profiler.enabled = true
  profiler.reset()

  console.log(`Running AI for ${TURNS_TO_PLAY} turns...`)
  const startTime = performance.now()
  delegateTurnsToAIPlayer('basic', TURNS_TO_PLAY)
  const endTime = performance.now()

  const totalMs = endTime - startTime
  const avgMs = totalMs / TURNS_TO_PLAY

  console.log('========================================')
  console.log(`Done! Total time: ${totalMs.toFixed(0)}ms`)
  console.log(`Average per turn: ${avgMs.toFixed(1)}ms`)
  console.log(`Final turn: ${getCurrentTurnStateFromStore(store).turn}`)
  console.log('========================================')

  writeProfilerCSVIfDataExists()

  // Print agent count
  const gameState = getCurrentTurnStateFromStore(store)
  console.log(`\nAgent count: ${gameState.agents.length}. Terminated: ${gameState.terminatedAgents.length}`)
}

function writeProfilerCSVIfDataExists(): void {
  // Generate and write CSV
  const csv = profiler.generateCSV()
  const csvLines = csv.split('\n')
  // CSV has data if it has more than just the header row
  const hasData = csvLines.length > 1

  if (hasData) {
    const csvPath = 'profile-results.csv'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- node:fs works at runtime with tsx
    writeFileSync(csvPath, csv, 'utf8')
    console.log(`\nProfiler CSV written to: ${csvPath}`)
  } else {
    console.log('\nNo profiler CSV generated. The profiler did not record any data.')
    console.log('This usually means no profiled functions were called, or profiler.startTurn() was never invoked.')
  }
}

await main()
