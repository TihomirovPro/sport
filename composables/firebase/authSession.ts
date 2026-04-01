import { LAST_AUTH_UID_STORAGE_KEY } from '~/composables/storageKeys'
import { idbStorage } from '~/composables/storage/idb'

export function readLastAuthUid(): string {
  if (!process.client) return ''
  return idbStorage.getItem(LAST_AUTH_UID_STORAGE_KEY) || ''
}

export function writeLastAuthUid(uid: string) {
  if (!process.client) return

  const normalizedUid = String(uid || '').trim()
  if (!normalizedUid) {
    idbStorage.removeItem(LAST_AUTH_UID_STORAGE_KEY)
    return
  }

  idbStorage.setItem(LAST_AUTH_UID_STORAGE_KEY, normalizedUid)
}

export function clearLastAuthUid() {
  if (!process.client) return
  idbStorage.removeItem(LAST_AUTH_UID_STORAGE_KEY)
}
