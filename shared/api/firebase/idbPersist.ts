import { idbStorage } from '~/shared/api/storage/idb'

export function readJson<T>(key: string, fallback: T): T {
  if (!process.client) return fallback

  const raw = idbStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown) {
  if (!process.client) return
  idbStorage.setItem(key, JSON.stringify(value))
}

/** Returns a debounced persist function tied to the given IDB key and delay. */
export function createPersister(key: string, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function persist(valueGetter: () => unknown) {
    if (!process.client) return
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      try {
        writeJson(key, valueGetter())
      } finally {
        timer = null
      }
    }, delay)
  }
}
