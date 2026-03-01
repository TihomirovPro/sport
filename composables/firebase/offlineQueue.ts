import { goOffline, goOnline, ref, remove, set, update } from 'firebase/database'
import { setOfflinePendingOperations, setOnlineStatus } from '~/composables/offlineState'
import { dbPath, getFirebaseAuth, getFirebaseDb, logFirebaseError } from './client'
import { clearOfflineCacheForUid, cloneValue } from './offlineCache'

const OFFLINE_QUEUE_KEY = 'pp-offline-queue-v1'
const PERSIST_DELAY_MS = 120

type PendingOperationType = 'set' | 'update' | 'remove'

type PendingOperation = {
  id: string
  uid: string
  path: string
  type: PendingOperationType
  data?: unknown
}

let pendingOperationsMemory: PendingOperation[] | null = null
let pendingOpsPersistTimer: ReturnType<typeof setTimeout> | null = null
let offlineSyncInitialized = false
let isFlushingQueue = false

function getStorage(): Storage | null {
  if (!process.client) return null
  return window.localStorage
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

function schedulePersist(valueGetter: () => unknown) {
  if (!process.client) return

  if (pendingOpsPersistTimer) {
    clearTimeout(pendingOpsPersistTimer)
  }

  pendingOpsPersistTimer = setTimeout(() => {
    try {
      writeJson(OFFLINE_QUEUE_KEY, valueGetter())
    } finally {
      pendingOpsPersistTimer = null
    }
  }, PERSIST_DELAY_MS)
}

function getCurrentUid(): string | null {
  return getFirebaseAuth().currentUser?.uid || null
}

function readPendingOperations(): PendingOperation[] {
  if (!pendingOperationsMemory) {
    pendingOperationsMemory = readJson<PendingOperation[]>(OFFLINE_QUEUE_KEY, [])
  }
  return pendingOperationsMemory
}

function writePendingOperations(operations: PendingOperation[]) {
  pendingOperationsMemory = operations
  schedulePersist(() => pendingOperationsMemory ?? [])
}

function prunePendingOperationsToUid(uid: string): PendingOperation[] {
  const queue = readPendingOperations()
  const filtered = queue.filter((item) => item.uid === uid)

  if (filtered.length !== queue.length) {
    writePendingOperations(filtered)
  }

  return filtered
}

function updatePendingStatus() {
  const uid = getCurrentUid()
  if (!uid) {
    setOfflinePendingOperations(0)
    return
  }

  const operations = prunePendingOperationsToUid(uid)
  setOfflinePendingOperations(operations.length)
}

export function enqueueOperation(type: PendingOperationType, path: string, data?: unknown) {
  const uid = getCurrentUid()
  if (!uid) throw new Error('Пользователь не авторизован')

  const operations = prunePendingOperationsToUid(uid)
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

  const queue = prunePendingOperationsToUid(uid)
  const currentUserQueue = queue

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

export function clearOfflineUserData(uid: string) {
  if (!process.client || !uid) return

  clearOfflineCacheForUid(uid)

  const queue = readPendingOperations()
  const filtered = queue.filter((item) => item.uid !== uid)
  if (filtered.length !== queue.length) {
    writePendingOperations(filtered)
  }

  updatePendingStatus()
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

export function getCurrentUserId() {
  return getCurrentUid()
}
