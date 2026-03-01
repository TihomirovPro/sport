import type { DataSnapshot } from 'firebase/database'

const OFFLINE_CACHE_KEY = 'pp-offline-cache-v1'
const PERSIST_DELAY_MS = 120

type OfflineCache = Record<string, Record<string, unknown>>

let offlineCacheMemory: OfflineCache | null = null
let offlineCachePersistTimer: ReturnType<typeof setTimeout> | null = null

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

export function cloneValue<T>(value: T): T {
  try {
    if (typeof structuredClone === 'function') return structuredClone(value)
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    return value
  }
}

function schedulePersist(valueGetter: () => unknown) {
  if (!process.client) return

  if (offlineCachePersistTimer) {
    clearTimeout(offlineCachePersistTimer)
  }

  offlineCachePersistTimer = setTimeout(() => {
    try {
      writeJson(OFFLINE_CACHE_KEY, valueGetter())
    } finally {
      offlineCachePersistTimer = null
    }
  }, PERSIST_DELAY_MS)
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
    if (key === undefined) continue
    const next = current[key]

    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      current[key] = {}
    }

    current = current[key] as Record<string, unknown>
  }

  const leaf = path[path.length - 1]
  if (leaf === undefined) return

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

function readOfflineCache(): OfflineCache {
  if (!offlineCacheMemory) {
    offlineCacheMemory = readJson<OfflineCache>(OFFLINE_CACHE_KEY, {})
  }
  return offlineCacheMemory
}

function writeOfflineCache(cache: OfflineCache) {
  offlineCacheMemory = cache
  schedulePersist(() => offlineCacheMemory ?? {})
}

export function readCachedPath(uid: string | null, path: string): unknown {
  if (!uid) return undefined

  const cache = readOfflineCache()
  const userTree = cache[uid]
  if (!userTree) return undefined

  return deepGet(userTree, splitPath(path))
}

export function updateCachedPath(uid: string | null, path: string, value: unknown, options: { merge?: boolean; remove?: boolean } = {}) {
  if (!uid) return

  const cache = readOfflineCache()
  const userTree = cache[uid] ?? {}
  deepSet(userTree, splitPath(path), value, options)
  cache[uid] = userTree
  writeOfflineCache(cache)
}

export function emitCachedSnapshot(uid: string | null, path: string, callback: (snapshot: DataSnapshot) => void) {
  const cachedValue = readCachedPath(uid, path)
  if (cachedValue === undefined) return

  callback({
    val: () => cloneValue(cachedValue)
  } as DataSnapshot)
}

export function clearOfflineCacheForUid(uid: string) {
  if (!process.client || !uid) return

  const cache = readOfflineCache()
  if (!cache[uid]) return

  delete cache[uid]
  writeOfflineCache(cache)
}
