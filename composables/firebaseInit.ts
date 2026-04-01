import type { DataSnapshot } from 'firebase/database'
import { child, onValue, push, ref, remove, set, update } from 'firebase/database'
import { dbPath, getFirebaseApp, getFirebaseAuth, getFirebaseDb, logFirebaseError } from '~/composables/firebase/client'
import { getOnlineStatus } from '~/composables/platform/ios'
import { emitCachedSnapshot, updateCachedPath } from '~/composables/firebase/offlineCache'
import { clearOfflineUserData, enqueueOperation, flushOfflineQueue, getCurrentUserId, getWriteTimeout, initOfflineSync } from '~/composables/firebase/offlineQueue'

export { getFirebaseApp, getFirebaseAuth, getFirebaseDb, clearOfflineUserData, initOfflineSync, flushOfflineQueue }

// Compat exports for stale cached chunks (PWA/SW) that may still import these names.
export const data = undefined
export const callback = undefined

const WRITE_TIMEOUT_CODE = 'pp/write-timeout'
const RETRIABLE_DB_ERROR_CODES = new Set([
  'database/network-error',
  'database/disconnected',
  'database/unavailable'
])

function isOfflineClient() {
  return process.client && !getOnlineStatus()
}

type FirebaseLikeError = {
  code?: string
  message?: string
}

function createWriteTimeoutError(): Error & { code: string } {
  const error = new Error('Превышено время ожидания записи')
  return Object.assign(error, { code: WRITE_TIMEOUT_CODE })
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(createWriteTimeoutError()), timeoutMs)

    promise.then((value) => {
      clearTimeout(timer)
      resolve(value)
    }).catch((error) => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

function isRetriableWriteError(error: unknown): boolean {
  const candidate = error as FirebaseLikeError | null | undefined
  const code = String(candidate?.code || '').trim()

  if (code === WRITE_TIMEOUT_CODE) return true
  if (RETRIABLE_DB_ERROR_CODES.has(code)) return true

  const message = String(candidate?.message || '').toLowerCase()
  if (!message) return false

  return message.includes('network')
    || message.includes('disconnected')
    || message.includes('offline')
    || message.includes('timeout')
}

function fallbackToOfflineWrite(
  uid: string | null,
  type: 'set' | 'update' | 'remove',
  path: string,
  data?: unknown
) {
  if (!uid) throw new Error('Пользователь не авторизован')

  if (type === 'remove') {
    updateCachedPath(uid, path, null, { remove: true })
    enqueueOperation('remove', path)
    return
  }

  if (type === 'update') {
    updateCachedPath(uid, path, data, { merge: true })
    enqueueOperation('update', path, data)
    return
  }

  updateCachedPath(uid, path, data)
  enqueueOperation('set', path, data)
}

export const createData = async <T>(path: string, data: T) => {
  initOfflineSync()

  const key = push(child(ref(getFirebaseDb()), path)).key
  if (!key) throw new Error('Не удалось создать ключ записи')
  const fullPath = `${path}/${key}`

  try {
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      if (!uid) throw new Error('Пользователь не авторизован')
      updateCachedPath(uid, fullPath, data)
      enqueueOperation('set', fullPath, data)
      return key
    }

    await withTimeout(set(ref(getFirebaseDb(), dbPath(fullPath)), data), getWriteTimeout())
    updateCachedPath(uid, fullPath, data)
    return key
  } catch (error) {
    const uid = getCurrentUserId()

    if (isRetriableWriteError(error) && uid) {
      fallbackToOfflineWrite(uid, 'set', fullPath, data)
      return key
    }

    logFirebaseError('createData', error)
    throw error
  }
}

export const createDataWithoutKey = async <T>(path: string, data: T) => {
  initOfflineSync()

  try {
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      if (!uid) throw new Error('Пользователь не авторизован')
      updateCachedPath(uid, path, data)
      enqueueOperation('set', path, data)
      return
    }

    await withTimeout(set(ref(getFirebaseDb(), dbPath(path)), data), getWriteTimeout())
    updateCachedPath(uid, path, data)
  } catch (error) {
    const uid = getCurrentUserId()
    if (isRetriableWriteError(error) && uid) {
      fallbackToOfflineWrite(uid, 'set', path, data)
      return
    }

    logFirebaseError('createDataWithoutKey', error)
    throw error
  }
}

export const updateData = async <T extends object>(path: string, data: T) => {
  initOfflineSync()

  try {
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      if (!uid) throw new Error('Пользователь не авторизован')
      updateCachedPath(uid, path, data, { merge: true })
      enqueueOperation('update', path, data)
      return
    }

    await withTimeout(update(ref(getFirebaseDb(), dbPath(path)), data), getWriteTimeout())
    updateCachedPath(uid, path, data, { merge: true })
  } catch (error) {
    const uid = getCurrentUserId()
    if (isRetriableWriteError(error) && uid) {
      fallbackToOfflineWrite(uid, 'update', path, data)
      return
    }

    logFirebaseError('updateData', error)
    throw error
  }
}

export const removeData = async (path: string) => {
  initOfflineSync()

  try {
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      if (!uid) throw new Error('Пользователь не авторизован')
      updateCachedPath(uid, path, null, { remove: true })
      enqueueOperation('remove', path)
      return
    }

    await withTimeout(remove(ref(getFirebaseDb(), dbPath(path))), getWriteTimeout())
    updateCachedPath(uid, path, null, { remove: true })
  } catch (error) {
    const uid = getCurrentUserId()
    if (isRetriableWriteError(error) && uid) {
      fallbackToOfflineWrite(uid, 'remove', path)
      return
    }

    logFirebaseError('removeData', error)
    throw error
  }
}

export const onData = (path: string, callback: (snapshot: DataSnapshot) => void) => {
  initOfflineSync()

  try {
    emitCachedSnapshot(getCurrentUserId(), path, callback)
  } catch (cachedError) {
    logFirebaseError('onDataCachedBeforeSubscribe', cachedError)
  }

  try {
    return onValue(
      ref(getFirebaseDb(), dbPath(path)),
      (snapshot) => {
        const value = snapshot.val()
        const uid = getCurrentUserId()

        if (value === null) updateCachedPath(uid, path, null, { remove: true })
        else updateCachedPath(uid, path, value)

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
      emitCachedSnapshot(getCurrentUserId(), path, callback)
    } catch (cachedError) {
      logFirebaseError('onDataCached', cachedError)
    }

    return () => {}
  }
}
