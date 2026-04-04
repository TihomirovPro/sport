import type { DataSnapshot } from 'firebase/database'
import { createData, onData, removeData } from '~/shared/api/firebaseInit'
import type { MeasureType, MeasureEntry } from '~/stores/measure'

const TYPES_PATH = 'measureTypes'
const ENTRIES_PATH = 'measureEntries'

type TypeRecord = { name?: unknown; unit?: unknown }
type EntryRecord = { value?: unknown; createdAt?: unknown }

let typesUnsubscribe: (() => void) | null = null
const entriesUnsubscribes: Record<string, () => void> = {}

function parseTypes(snapshot: DataSnapshot): MeasureType[] {
  const val = snapshot.val() as Record<string, TypeRecord> | null
  if (!val || typeof val !== 'object') return []

  return Object.entries(val)
    .map(([id, record]) => ({
      id,
      name: String(record.name ?? ''),
      unit: String(record.unit ?? ''),
    }))
    .filter(t => t.name.length > 0)
}

function parseEntries(typeId: string, snapshot: DataSnapshot): MeasureEntry[] {
  const val = snapshot.val() as Record<string, EntryRecord> | null
  if (!val || typeof val !== 'object') return []

  return Object.entries(val)
    .map(([id, record]) => {
      const value = Number(record.value)
      const createdAt = Number(record.createdAt)
      if (!Number.isFinite(value) || value <= 0) return null
      if (!Number.isFinite(createdAt) || createdAt <= 0) return null
      return { id, typeId, value, createdAt }
    })
    .filter((e): e is MeasureEntry => Boolean(e))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function stopMeasureTypesSubscription() {
  typesUnsubscribe?.()
  typesUnsubscribe = null
}

export function subscribeMeasureTypes() {
  const store = useMeasureStore()
  stopMeasureTypesSubscription()

  typesUnsubscribe = onData(TYPES_PATH, (snapshot) => {
    store.setTypes(parseTypes(snapshot))
  })

  return typesUnsubscribe
}

export function stopMeasureEntriesSubscription(typeId: string) {
  entriesUnsubscribes[typeId]?.()
  delete entriesUnsubscribes[typeId]
}

export function subscribeMeasureEntries(typeId: string) {
  const store = useMeasureStore()
  stopMeasureEntriesSubscription(typeId)

  entriesUnsubscribes[typeId] = onData(`${ENTRIES_PATH}/${typeId}`, (snapshot) => {
    store.setEntries(typeId, parseEntries(typeId, snapshot))
  })

  return entriesUnsubscribes[typeId]
}

export async function addMeasureType(name: string, unit: string) {
  await createData(TYPES_PATH, { name: name.trim(), unit: unit.trim() })
}

export async function removeMeasureType(id: string) {
  await removeData(`${TYPES_PATH}/${id}`)
  await removeData(`${ENTRIES_PATH}/${id}`)
}

export async function addMeasureEntry(typeId: string, value: number, createdAt?: number) {
  const timestamp = Number.isFinite(createdAt) && (createdAt as number) > 0
    ? Number(createdAt)
    : Date.now()

  await createData(`${ENTRIES_PATH}/${typeId}`, {
    value: Number(value.toFixed(1)),
    createdAt: timestamp,
  })
}

export async function removeMeasureEntry(typeId: string, id: string) {
  await removeData(`${ENTRIES_PATH}/${typeId}/${id}`)
}
