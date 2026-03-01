import type { DataSnapshot } from 'firebase/database'
import { child, onValue, push, ref, remove, set, update } from 'firebase/database'
import { dbPath, getFirebaseApp, getFirebaseAuth, getFirebaseDb, logFirebaseError } from '~/composables/firebase/client'
import { emitCachedSnapshot, updateCachedPath } from '~/composables/firebase/offlineCache'
import { clearOfflineUserData, enqueueOperation, flushOfflineQueue, getCurrentUserId, initOfflineSync } from '~/composables/firebase/offlineQueue'

export { getFirebaseApp, getFirebaseAuth, getFirebaseDb, clearOfflineUserData, initOfflineSync, flushOfflineQueue }

function isOfflineClient() {
  return process.client && !navigator.onLine
}

export const createData = async <T>(path: string, data: T) => {
  initOfflineSync()

  try {
    const key = push(child(ref(getFirebaseDb()), path)).key
    if (!key) throw new Error('Не удалось создать ключ записи')
    const fullPath = `${path}/${key}`
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      updateCachedPath(uid, fullPath, data)
      enqueueOperation('set', fullPath, data)
      return key
    }

    await set(ref(getFirebaseDb(), dbPath(fullPath)), data)
    updateCachedPath(uid, fullPath, data)
    return key
  } catch (error) {
    logFirebaseError('createData', error)
    throw error
  }
}

export const createDataWithoutKey = async <T>(path: string, data: T) => {
  initOfflineSync()

  try {
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      updateCachedPath(uid, path, data)
      enqueueOperation('set', path, data)
      return
    }

    await set(ref(getFirebaseDb(), dbPath(path)), data)
    updateCachedPath(uid, path, data)
  } catch (error) {
    logFirebaseError('createDataWithoutKey', error)
    throw error
  }
}

export const updateData = async <T extends object>(path: string, data: T) => {
  initOfflineSync()

  try {
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      updateCachedPath(uid, path, data, { merge: true })
      enqueueOperation('update', path, data)
      return
    }

    await update(ref(getFirebaseDb(), dbPath(path)), data)
    updateCachedPath(uid, path, data, { merge: true })
  } catch (error) {
    logFirebaseError('updateData', error)
    throw error
  }
}

export const removeData = async (path: string) => {
  initOfflineSync()

  try {
    const uid = getCurrentUserId()

    if (isOfflineClient()) {
      updateCachedPath(uid, path, null, { remove: true })
      enqueueOperation('remove', path)
      return
    }

    await remove(ref(getFirebaseDb(), dbPath(path)))
    updateCachedPath(uid, path, null, { remove: true })
  } catch (error) {
    logFirebaseError('removeData', error)
    throw error
  }
}

export const onData = (path: string, callback: (snapshot: DataSnapshot) => void) => {
  initOfflineSync()

  try {
    emitCachedSnapshot(getCurrentUserId(), path, callback)

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
