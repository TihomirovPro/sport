import { goOffline, goOnline, onValue, ref, remove, set, update } from 'firebase/database'
import { setOfflinePendingOperations, setOnlineStatus, setRetryDelay } from '~/composables/offlineState'
import { dbPath, getFirebaseAuth, getFirebaseDb, logFirebaseError } from './client'
import { readLastAuthUid } from './authSession'
import { clearOfflineCacheForUid, cloneValue } from './offlineCache'
import { IDB_KEYS } from '~/composables/storage/keys'
import { idbStorage } from '~/composables/storage/idb'
import { getOnlineStatus } from '~/composables/platform/ios'

const OFFLINE_QUEUE_KEY = IDB_KEYS.OFFLINE_QUEUE
const PERSIST_DELAY_MS = 120
const FLUSH_RETRY_BASE_MS = 1_500
const FLUSH_RETRY_MAX_MS = 30_000
const MAX_PENDING_OPERATIONS = 500
const OPERATION_TTL_MS = 1000 * 60 * 60 * 24 * 30

type PendingOperationType = 'set' | 'update' | 'remove'

type PendingOperation = {
  id: string
  uid: string
  path: string
  type: PendingOperationType
  data?: unknown
  createdAt: number
}

let pendingOperationsMemory: PendingOperation[] | null = null
let pendingOpsPersistTimer: ReturnType<typeof setTimeout> | null = null
let flushRetryTimer: ReturnType<typeof setTimeout> | null = null
let flushFailureCount = 0
let offlineSyncInitialized = false
let isFlushingQueue = false
let isFirebaseConnected = true

function readJson<T>(key: string, fallback: T): T {
  if (!process.client) return fallback

  const raw = idbStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (!process.client) return
  idbStorage.setItem(key, JSON.stringify(value))
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
  return getFirebaseAuth().currentUser?.uid || readLastAuthUid() || null
}

function isPendingOperationType(value: unknown): value is PendingOperationType {
  return value === 'set' || value === 'update' || value === 'remove'
}

function normalizeOperation(raw: unknown): PendingOperation | null {
  if (!raw || typeof raw !== 'object') return null

  const candidate = raw as Partial<PendingOperation>
  const id = String(candidate.id || '').trim()
  const uid = String(candidate.uid || '').trim()
  const path = normalizePath(String(candidate.path || ''))

  if (!id || !uid || !path || !isPendingOperationType(candidate.type)) {
    return null
  }

  const normalizedCreatedAt = Number(candidate.createdAt)
  const createdAt = Number.isFinite(normalizedCreatedAt) && normalizedCreatedAt > 0
    ? normalizedCreatedAt
    : Date.now()

  return {
    id,
    uid,
    path,
    type: candidate.type,
    data: cloneValue(candidate.data),
    createdAt
  }
}

function normalizeOperations(rawOperations: unknown[]): PendingOperation[] {
  return rawOperations
    .map(normalizeOperation)
    .filter((item): item is PendingOperation => Boolean(item))
}

function pruneExpiredOperations(operations: PendingOperation[]): PendingOperation[] {
  const now = Date.now()
  return operations.filter((operation) => (now - operation.createdAt) <= OPERATION_TTL_MS)
}

function trimOperations(operations: PendingOperation[]): PendingOperation[] {
  if (operations.length <= MAX_PENDING_OPERATIONS) return operations
  return operations.slice(operations.length - MAX_PENDING_OPERATIONS)
}

function readPendingOperations(): PendingOperation[] {
  if (!pendingOperationsMemory) {
    const rawQueue = readJson<unknown>(OFFLINE_QUEUE_KEY, [])
    const rawList = Array.isArray(rawQueue) ? rawQueue : []
    const normalized = normalizeOperations(rawList)
    const prepared = trimOperations(pruneExpiredOperations(normalized))

    pendingOperationsMemory = prepared

    if (prepared.length !== normalized.length) {
      schedulePersist(() => pendingOperationsMemory ?? [])
    }
  }
  return pendingOperationsMemory
}

function writePendingOperations(operations: PendingOperation[]) {
  pendingOperationsMemory = operations
  schedulePersist(() => pendingOperationsMemory ?? [])
}

function normalizePath(path: string): string {
  return path.split('/').filter(Boolean).join('/')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergeUpdatePayload(prev: unknown, next: unknown): Record<string, unknown> {
  const prevObject = isPlainObject(prev) ? prev : {}
  const nextObject = isPlainObject(next) ? next : {}
  return { ...prevObject, ...nextObject }
}

function compactOperations(operations: PendingOperation[]): PendingOperation[] {
  const compacted: PendingOperation[] = []

  for (const current of operations) {
    const lastIndex = compacted.findLastIndex(
      (item) => item.uid === current.uid && item.path === current.path
    )
    const last = lastIndex >= 0 ? compacted[lastIndex] : null

    if (!last) {
      compacted.push(current)
      continue
    }

    if (current.type === 'remove') {
      compacted[lastIndex] = current
      continue
    }

    if (current.type === 'set') {
      compacted[lastIndex] = current
      continue
    }

    // Ниже обрабатывается case current.type === 'update'
    if (last.type === 'remove') {
      compacted[lastIndex] = {
        ...current,
        type: 'set',
        data: mergeUpdatePayload({}, current.data)
      }
      continue
    }

    if (last.type === 'set') {
      compacted[lastIndex] = {
        ...last,
        id: current.id,
        data: mergeUpdatePayload(last.data, current.data),
        createdAt: current.createdAt
      }
      continue
    }

    compacted[lastIndex] = {
      ...last,
      id: current.id,
      data: mergeUpdatePayload(last.data, current.data),
      createdAt: current.createdAt
    }
  }

  return compacted
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
  const normalizedPath = normalizePath(path)
  if (!normalizedPath) throw new Error('Некорректный путь для оффлайн-операции')

  operations.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    uid,
    type,
    path: normalizedPath,
    data: cloneValue(data),
    createdAt: Date.now()
  })

  writePendingOperations(trimOperations(compactOperations(operations)))
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
  if (!process.client || isFlushingQueue || !getOnlineStatus() || !isFirebaseConnected) return

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
    let hadError = false

    const blockedPaths = new Set<string>()
    for (const operation of currentUserQueue) {
      if (blockedPaths.has(operation.path)) continue

      try {
        await runPendingOperation(operation)
        const operationIndex = remaining.findIndex((item) => item.id === operation.id)
        if (operationIndex >= 0) {
          remaining.splice(operationIndex, 1)
          writePendingOperations(remaining)
          setOfflinePendingOperations(remaining.length)
        }
      } catch (error) {
        hadError = true
        blockedPaths.add(operation.path)
        logFirebaseError('flushOfflineQueueItem', error)
      }
    }

    if (!hadError) {
      flushFailureCount = 0
      setRetryDelay(0)
      if (flushRetryTimer) {
        clearTimeout(flushRetryTimer)
        flushRetryTimer = null
      }
      writePendingOperations(remaining)
    } else {
      flushFailureCount += 1
      const baseDelay = Math.min(FLUSH_RETRY_BASE_MS * (2 ** (flushFailureCount - 1)), FLUSH_RETRY_MAX_MS)
      const retryDelay = Math.round(baseDelay * (0.5 + Math.random() * 0.5))
      setRetryDelay(retryDelay)

      if (flushRetryTimer) clearTimeout(flushRetryTimer)
      flushRetryTimer = setTimeout(() => {
        flushRetryTimer = null
        setRetryDelay(0)
        if (getOnlineStatus() && isFirebaseConnected) void flushOfflineQueue()
      }, retryDelay)
    }
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

  flushFailureCount = 0
  setRetryDelay(0)
  if (flushRetryTimer) {
    clearTimeout(flushRetryTimer)
    flushRetryTimer = null
  }

  updatePendingStatus()
}

export function initOfflineSync() {
  if (!process.client || offlineSyncInitialized) return

  offlineSyncInitialized = true
  setOnlineStatus(getOnlineStatus())
  updatePendingStatus()

  try {
    if (getOnlineStatus()) goOnline(getFirebaseDb())
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

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && getOnlineStatus()) {
      void flushOfflineQueue()
    }
  })

  try {
    onValue(ref(getFirebaseDb(), '.info/connected'), (snap) => {
      isFirebaseConnected = snap.val() === true
      if (isFirebaseConnected && getOnlineStatus()) {
        void flushOfflineQueue()
      }
    })
  } catch (error) {
    logFirebaseError('initFirebaseConnected', error)
  }

  void flushOfflineQueue()
}

export function getCurrentUserId() {
  return getCurrentUid()
}

export function getWriteTimeout(): number {
  if (flushFailureCount >= 3) return 1_500
  if (flushFailureCount >= 1) return 3_000
  return 4_500
}
