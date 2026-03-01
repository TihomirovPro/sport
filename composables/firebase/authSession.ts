import { LAST_AUTH_UID_STORAGE_KEY } from '~/composables/storageKeys'

function getStorage(): Storage | null {
  if (!process.client) return null
  return window.localStorage
}

export function readLastAuthUid(): string {
  const storage = getStorage()
  if (!storage) return ''
  return storage.getItem(LAST_AUTH_UID_STORAGE_KEY) || ''
}

export function writeLastAuthUid(uid: string) {
  const storage = getStorage()
  if (!storage) return

  const normalizedUid = String(uid || '').trim()
  if (!normalizedUid) {
    storage.removeItem(LAST_AUTH_UID_STORAGE_KEY)
    return
  }

  storage.setItem(LAST_AUTH_UID_STORAGE_KEY, normalizedUid)
}

export function clearLastAuthUid() {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(LAST_AUTH_UID_STORAGE_KEY)
}
