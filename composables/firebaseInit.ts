import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import type { FirebaseApp } from 'firebase/app'
import type { DataSnapshot, Database } from 'firebase/database'
import { child, getDatabase, onValue, ref, remove, set, update, push, goOffline, goOnline } from 'firebase/database'
import { setOfflinePendingOperations, setOnlineStatus } from './offlineState'

interface firebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

let firebaseApp: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null
let offlineSyncInitialized = false
let isFlushingQueue = false

const OFFLINE_CACHE_KEY = 'pp-offline-cache-v1'
const OFFLINE_QUEUE_KEY = 'pp-offline-queue-v1'

type PendingOperationType = 'set' | 'update' | 'remove'

type PendingOperation = {
  id: string
  uid: string
  path: string
  type: PendingOperationType
  data?: unknown
}

type OfflineCache = Record<string, Record<string, unknown>>

function getFirebaseConfig(): firebaseConfig {
  const config = useRuntimeConfig()

  return {
    apiKey: config.public.FIREBASE_API_KEY,
    authDomain: config.public.AUTH_DOMAIN,
    databaseURL: config.public.DATABASE_URL,
    projectId: config.public.PROJECT_ID,
    storageBucket: config.public.STORAGE_BUCKET,
    messagingSenderId: config.public.MESSAGING_SENDER_ID,
    appId: config.public.APP_ID
  }
}

function ensureFirebaseInit() {
  if (firebaseApp && db && auth) return

  firebaseApp = initializeApp(getFirebaseConfig())
  db = getDatabase(firebaseApp)
  auth = getAuth(firebaseApp)
}

export const getFirebaseApp = () => {
  ensureFirebaseInit()
  return firebaseApp as FirebaseApp
}

export const getFirebaseDb = () => {
  ensureFirebaseInit()
  return db as Database
}

export const getFirebaseAuth = () => {
  ensureFirebaseInit()
  return auth as Auth
}

export function dbPath(path:string):string {
  const userID = getFirebaseAuth().currentUser?.uid
  if (!userID) throw new Error('Пользователь не авторизован')
  return `users/${userID}/${path}`
}

function getStorage(): Storage | null {
  if (!process.client) return null
  return window.localStorage
}

function cloneValue<T>(value: T): T {
  try {
    if (typeof structuredClone === 'function') return structuredClone(value)
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    return value
  }
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage()
  if (!storage) return fallback

  const raw = storage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(key, JSON.stringify(value))
}

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean)
}

function deepGet(target: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = target

  for (const key of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

function deepSet(
  target: Record<string, unknown>,
  path: string[],
  value: unknown,
  options: { merge?: boolean; remove?: boolean } = {}
) {
  if (!path.length) return

  let current = target

  for (let index = 0; index < path.length - 1; index++) {
    const key = path[index]
    const next = current[key]

    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      current[key] = {}
    }

    current = current[key] as Record<string, unknown>
  }

  const leaf = path[path.length - 1]

  if (options.remove) {
    delete current[leaf]
    return
  }

  if (options.merge) {
    const prev = current[leaf]
    const source = (value && typeof value === 'object' && !Array.isArray(value))
      ? value as Record<string, unknown>
      : {}
    const base = (prev && typeof prev === 'object' && !Array.isArray(prev))
      ? prev as Record<string, unknown>
      : {}

    current[leaf] = { ...base, ...source }
    return
  }

  current[leaf] = cloneValue(value)
}

function getCurrentUid(): string | null {
  return getFirebaseAuth().currentUser?.uid || null
}

function readOfflineCache(): OfflineCache {
  return readJson<OfflineCache>(OFFLINE_CACHE_KEY, {})
}

function writeOfflineCache(cache: OfflineCache) {
  writeJson(OFFLINE_CACHE_KEY, cache)
}

function readPendingOperations(): PendingOperation[] {
  return readJson<PendingOperation[]>(OFFLINE_QUEUE_KEY, [])
}

function writePendingOperations(operations: PendingOperation[]) {
  writeJson(OFFLINE_QUEUE_KEY, operations)
}

function updatePendingStatus() {
  const operations = readPendingOperations()
  setOfflinePendingOperations(operations.length)
}

function readCachedPath(path: string): unknown {
  const uid = getCurrentUid()
  if (!uid) return undefined

  const cache = readOfflineCache()
  const userTree = cache[uid]
  if (!userTree) return undefined

  return deepGet(userTree, splitPath(path))
}

function updateCachedPath(path: string, value: unknown, options: { merge?: boolean; remove?: boolean } = {}) {
  const uid = getCurrentUid()
  if (!uid) return

  const cache = readOfflineCache()
  const userTree = cache[uid] ?? {}
  deepSet(userTree, splitPath(path), value, options)
  cache[uid] = userTree
  writeOfflineCache(cache)
}

function enqueueOperation(type: PendingOperationType, path: string, data?: unknown) {
  const uid = getCurrentUid()
  if (!uid) throw new Error('Пользователь не авторизован')

  const operations = readPendingOperations()
  operations.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    uid,
    type,
    path,
    data: cloneValue(data)
  })
  writePendingOperations(operations)
  updatePendingStatus()
}

function emitCachedSnapshot(path: string, callback: (snapshot: DataSnapshot) => void) {
  const cachedValue = readCachedPath(path)
  if (cachedValue === undefined) return

  callback({
    val: () => cloneValue(cachedValue)
  } as DataSnapshot)
}

async function runPendingOperation(operation: PendingOperation) {
  if (operation.type === 'set') {
    await set(ref(getFirebaseDb(), dbPath(operation.path)), operation.data)
    return
  }

  if (operation.type === 'update') {
    const data = operation.data && typeof operation.data === 'object' ? operation.data as Record<string, unknown> : {}
    await update(ref(getFirebaseDb(), dbPath(operation.path)), data)
    return
  }

  await remove(ref(getFirebaseDb(), dbPath(operation.path)))
}

export async function flushOfflineQueue() {
  if (!process.client || isFlushingQueue || !navigator.onLine) return

  const uid = getCurrentUid()
  if (!uid) {
    updatePendingStatus()
    return
  }

  const queue = readPendingOperations()
  const currentUserQueue = queue.filter((item) => item.uid === uid)

  if (!currentUserQueue.length) {
    updatePendingStatus()
    return
  }

  isFlushingQueue = true

  try {
    const remaining = [...queue]

    for (const operation of currentUserQueue) {
      await runPendingOperation(operation)
      const operationIndex = remaining.findIndex((item) => item.id === operation.id)
      if (operationIndex >= 0) remaining.splice(operationIndex, 1)
    }

    writePendingOperations(remaining)
  } catch (error) {
    logFirebaseError('flushOfflineQueue', error)
  } finally {
    isFlushingQueue = false
    updatePendingStatus()
  }
}

export function initOfflineSync() {
  if (!process.client || offlineSyncInitialized) return

  offlineSyncInitialized = true
  setOnlineStatus(navigator.onLine)
  updatePendingStatus()

  try {
    if (navigator.onLine) goOnline(getFirebaseDb())
    else goOffline(getFirebaseDb())
  } catch (error) {
    logFirebaseError('initOfflineSyncConnection', error)
  }

  window.addEventListener('online', () => {
    setOnlineStatus(true)
    try {
      goOnline(getFirebaseDb())
    } catch (error) {
      logFirebaseError('goOnline', error)
    }
    void flushOfflineQueue()
  })

  window.addEventListener('offline', () => {
    setOnlineStatus(false)
    try {
      goOffline(getFirebaseDb())
    } catch (error) {
      logFirebaseError('goOffline', error)
    }
  })

  void flushOfflineQueue()
}

function logFirebaseError(operation:string, error:unknown) {
  console.error(`[firebase:${operation}]`, error)
}

export const createData = async <T>(path:string, data:T) => {
  initOfflineSync()

  try {
    const key = push(child(ref(getFirebaseDb()), path)).key
    if (!key) throw new Error('Не удалось создать ключ записи')
    const fullPath = `${path}/${key}`

    if (process.client && !navigator.onLine) {
      updateCachedPath(fullPath, data)
      enqueueOperation('set', fullPath, data)
      return key
    }

    await set(ref(getFirebaseDb(), dbPath(fullPath)), data)
    updateCachedPath(fullPath, data)
    return key
  } catch (error) {
    logFirebaseError('createData', error)
    throw error
  }
}

export const createDataWithoutKey = async <T>(path:string, data:T) => {
  initOfflineSync()

  try {
    if (process.client && !navigator.onLine) {
      updateCachedPath(path, data)
      enqueueOperation('set', path, data)
      return
    }

    await set(ref(getFirebaseDb(), dbPath(path)), data)
    updateCachedPath(path, data)
  } catch (error) {
    logFirebaseError('createDataWithoutKey', error)
    throw error
  }
}

export const updateData = async <T>(path:string, data:T) => {
  initOfflineSync()

  try {
    if (process.client && !navigator.onLine) {
      updateCachedPath(path, data, { merge: true })
      enqueueOperation('update', path, data)
      return
    }

    await update(ref(getFirebaseDb(), dbPath(path)), data)
    updateCachedPath(path, data, { merge: true })
  } catch (error) {
    logFirebaseError('updateData', error)
    throw error
  }
}

export const removeData = async (path:string) => {
  initOfflineSync()

  try {
    if (process.client && !navigator.onLine) {
      updateCachedPath(path, null, { remove: true })
      enqueueOperation('remove', path)
      return
    }

    await remove(ref(getFirebaseDb(), dbPath(path)))
    updateCachedPath(path, null, { remove: true })
  } catch (error) {
    logFirebaseError('removeData', error)
    throw error
  }
}

export const onData = (path:string, callback:(snapshot: DataSnapshot) => void) => {
  initOfflineSync()

  try {
    emitCachedSnapshot(path, callback)

    return onValue(
      ref(getFirebaseDb(), dbPath(path)),
      (snapshot) => {
        const value = snapshot.val()
        if (value === null) updateCachedPath(path, null, { remove: true })
        else updateCachedPath(path, value)

        try {
          callback(snapshot)
        } catch (error) {
          logFirebaseError('onDataCallback', error)
        }
      },
      (error) => logFirebaseError('onData', error)
    )
  } catch (error) {
    logFirebaseError('onDataInit', error)

    try {
      emitCachedSnapshot(path, callback)
    } catch (cachedError) {
      logFirebaseError('onDataCached', cachedError)
    }

    return () => {}
  }
}
