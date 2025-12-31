import Dexie from 'dexie'
import type { RootReducerState } from './rootReducer'
import { assertDefined } from '../lib/primitives/assertPrimitives'

const DB_NAME = 'GameStateDB'
const STORE_KEY = 'main'
const STATE_VERSION = 1

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface PersistedState {
  id: string
  version: number
  rootState: RootReducerState
}

class GameDexie extends Dexie {
  public game!: Dexie.Table<PersistedState, string>

  public constructor() {
    super(DB_NAME)
    this.version(1).stores({
      game: 'id',
    })
  }
}

let _db: GameDexie | undefined

/**
 * Initialize the Dexie database. Must be called before other persist functions.
 * This is called by initStore() to ensure proper initialization order.
 */
export function initPersistence(): void {
  _db ??= new GameDexie()
}

function getDb(): GameDexie {
  assertDefined(_db, 'Persistence not initialized. Call initPersistence() first.')
  return _db
}

/**
 * Load persisted state from IndexedDB and apply migrations if needed
 */
export async function loadPersistedState(): Promise<RootReducerState | undefined> {
  try {
    const record = await getDb().game.get(STORE_KEY)
    if (!record) {
      return undefined
    }

    if (record.version !== STATE_VERSION) {
      // Add migration logic here
      console.warn('Persisted state version mismatch. Resetting state.')
      await getDb().game.delete(STORE_KEY)
      return undefined
    }

    return record.rootState
  } catch (error) {
    console.error('Failed to load state from Dexie', error)
    return undefined
  }
}

/**
 * Save selected state to IndexedDB
 */
export async function saveStateToDexie(state: RootReducerState): Promise<void> {
  try {
    const record: PersistedState = {
      id: STORE_KEY,
      version: STATE_VERSION,
      rootState: state,
    }
    await getDb().game.put(record)
  } catch (error) {
    console.error('Failed to save state to Dexie', error)
  }
}

/**
 * Wipe the entire IndexedDB database
 */
export async function wipeStorage(): Promise<void> {
  try {
    await getDb().delete()
    console.log('IndexedDB database wiped successfully')
  } catch (error) {
    console.error('Failed to wipe IndexedDB database', error)
  }
}
