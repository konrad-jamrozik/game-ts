/**
 * Standalone AI profiling script.
 *
 * This script runs the AI directly without Vitest, enabling accurate CPU profiling.
 *
 * Usage:
 *   cd web
 *   npx tsx --cpu-prof scripts/profileAi.ts
 *
 * Then load the generated .cpuprofile file in Chrome DevTools → Performance tab.
 * The profiler CSV output is written to profile-results.csv.
 */
// @ts-expect-error - node:fs works at runtime with tsx but isn't in tsconfig.app.json
import { writeFileSync } from 'node:fs'
import { initStore, getStore } from '../src/redux/store'
import { reset } from '../src/redux/slices/gameStateSlice'
import { clearEvents } from '../src/redux/slices/eventsSlice'
import { bldInitialState } from '../src/lib/factories/gameStateFactory'
import { delegateTurnsToAIPlayer } from '../src/ai/delegateTurnsToAIPlayer'
import { rand } from '../src/lib/primitives/rand'
import { profiler } from '../src/lib/primitives/profiler'
import { getCurrentTurnStateFromStore } from '../src/redux/storeUtils'

const TURNS_TO_PLAY = 200

console.log('Initializing store...')
await initStore({ undoLimit: 0, enablePersistence: false })
const store = getStore()

console.log('Setting up game state with 100,000 money...')
const customState = { ...bldInitialState(), money: 100_000 }
store.dispatch(reset({ customState }))
store.dispatch(clearEvents())

// Configure for deterministic success (same as the test)
rand.set('lead-investigation', 1)
rand.set('agent_attack_roll', 1)
rand.set('enemy_attack_roll', 0)

// Enable profiler
profiler.enabled = true
profiler.reset()

console.log(`Starting AI for ${TURNS_TO_PLAY} turns...`)
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

// Generate and write CSV
const csv = profiler.generateCSV()
const csvPath = 'profile-results.csv'
// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- node:fs works at runtime with tsx
writeFileSync(csvPath, csv, 'utf8')
console.log(`\nProfiler CSV written to: ${csvPath}`)

// Print agent count
const gameState = getCurrentTurnStateFromStore(store)
console.log(`\nAgent count: ${gameState.agents.length}`)
