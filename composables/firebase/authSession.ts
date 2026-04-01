import { IDB_KEYS } from '~/composables/storage/keys'
import { idbStorage } from '~/composables/storage/idb'

export function readLastAuthUid(): string {
  if (!process.client) return ''
  return idbStorage.getItem(IDB_KEYS.LAST_AUTH_UID) || ''
}

export function writeLastAuthUid(uid: string) {
  if (!process.client) return

  const normalizedUid = String(uid || '').trim()
  if (!normalizedUid) {
    idbStorage.removeItem(IDB_KEYS.LAST_AUTH_UID)
    return
  }

  idbStorage.setItem(IDB_KEYS.LAST_AUTH_UID, normalizedUid)
}

export function clearLastAuthUid() {
  if (!process.client) return
  idbStorage.removeItem(IDB_KEYS.LAST_AUTH_UID)
}
