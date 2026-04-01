const DB_NAME = 'pp-storage'
const STORE_NAME = 'keyval'
const DB_VERSION = 1
const MIGRATION_FLAG = '__idb_migrated_v1'

// Fixed keys to migrate from localStorage on first run
const FIXED_MIGRATION_KEYS = [
  'pp-last-auth-uid-v1',
  'pp-offline-queue-v1',
  'pp-offline-cache-v1',
  'newWorkout',
  'approaches',
  'activeExercise',
  'hideFilterTitles',
  'baseColor',
]

let db: IDBDatabase | null = null
const memoryCache = new Map<string, string>()

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result)
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error)
  })
}

function loadAllFromDb(): Promise<Map<string, string>> {
  return new Promise((resolve) => {
    if (!db) {
      resolve(new Map())
      return
    }

    const result = new Map<string, string>()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).openCursor()

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
      if (cursor) {
        if (typeof cursor.value === 'string') {
          result.set(String(cursor.key), cursor.value)
        }
        cursor.continue()
      } else {
        resolve(result)
      }
    }

    request.onerror = () => resolve(result)
  })
}

function writeToDb(key: string, value: string): void {
  if (!db) return
  try {
    db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key)
  } catch {
    // silent
  }
}

function deleteFromDb(key: string): void {
  if (!db) return
  try {
    db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key)
  } catch {
    // silent
  }
}

function migrateFromLocalStorage(): void {
  try {
    for (const key of FIXED_MIGRATION_KEYS) {
      const value = window.localStorage.getItem(key)
      if (value !== null) {
        memoryCache.set(key, value)
        writeToDb(key, value)
        window.localStorage.removeItem(key)
      }
    }

    // Dynamic keys: workout-progression-settings-v1:*
    const dynamicKeys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith('workout-progression-settings-v1:')) {
        dynamicKeys.push(key)
      }
    }
    for (const key of dynamicKeys) {
      const value = window.localStorage.getItem(key)
      if (value !== null) {
        memoryCache.set(key, value)
        writeToDb(key, value)
        window.localStorage.removeItem(key)
      }
    }

    writeToDb(MIGRATION_FLAG, '1')
  } catch {
    // silent — migration failure is non-fatal
  }
}

export async function initIdbStorage(): Promise<void> {
  try {
    db = await openDb()
    const entries = await loadAllFromDb()

    for (const [key, value] of entries) {
      memoryCache.set(key, value)
    }

    if (!entries.has(MIGRATION_FLAG)) {
      migrateFromLocalStorage()
    }
  } catch {
    // If IDB is unavailable, the in-memory cache still works for the session
  }
}

export const idbStorage = {
  getItem(key: string): string | null {
    return memoryCache.get(key) ?? null
  },

  setItem(key: string, value: string): void {
    memoryCache.set(key, value)
    writeToDb(key, value)
  },

  removeItem(key: string): void {
    memoryCache.delete(key)
    deleteFromDb(key)
  },
}
