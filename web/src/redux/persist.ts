import Dexie from 'dexie'
import type { RootState } from './rootReducer'

const DB_NAME = 'GameStateDB'
const STORE_KEY = 'main'
const STATE_VERSION = 2

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface PersistedState {
  id: string
  version: number
  rootState: RootState
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

const db = new GameDexie()

/**
 * Load persisted state from IndexedDB and apply migrations if needed
 */
export async function loadPersistedState(): Promise<RootState | undefined> {
  try {
    const record = await db.game.get(STORE_KEY)
    if (!record) {
      return undefined
    }

    if (record.version !== STATE_VERSION) {
      // Add migration logic here
      console.warn('Persisted state version mismatch. Resetting state.')
      await db.game.delete(STORE_KEY)
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
export async function saveStateToDexie(state: RootState): Promise<void> {
  try {
    const record: PersistedState = {
      id: STORE_KEY,
      version: STATE_VERSION,
      rootState: state,
    }
    await db.game.put(record)
  } catch (error) {
    console.error('Failed to save state to Dexie', error)
  }
}

/**
 * Wipe the entire IndexedDB database
 */
export async function wipeStorage(): Promise<void> {
  try {
    await db.delete()
    console.log('IndexedDB database wiped successfully')
  } catch (error) {
    console.error('Failed to wipe IndexedDB database', error)
  }
}
