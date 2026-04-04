import type { DataSnapshot } from 'firebase/database'
import { createData, onData, removeData } from '~/shared/api/firebaseInit'
import type { WeightEntry } from '~/stores/weight'

type WeightRecord = {
  value?: unknown
  createdAt?: unknown
}

let weightUnsubscribe: (() => void) | null = null
const WEIGHTS_PATH = 'user/weights'

function toWeightEntry(id: string, record: WeightRecord): WeightEntry | null {
  const value = Number(record.value)
  const createdAt = Number(record.createdAt)

  if (!Number.isFinite(value) || value <= 0) return null
  if (!Number.isFinite(createdAt) || createdAt <= 0) return null

  return {
    id,
    value,
    createdAt,
  }
}

function parseWeightRecords(snapshot: DataSnapshot): WeightEntry[] {
  const value = snapshot.val() as Record<string, WeightRecord> | null
  if (!value || typeof value !== 'object') return []

  return Object.entries(value)
    .map(([id, record]) => toWeightEntry(id, record))
    .filter((entry): entry is WeightEntry => Boolean(entry))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function stopWeightSubscription() {
  if (!weightUnsubscribe) return
  weightUnsubscribe()
  weightUnsubscribe = null
}

export function subscribeWeights() {
  const weightStore = useWeightStore()

  stopWeightSubscription()

  weightUnsubscribe = onData(WEIGHTS_PATH, (snapshot) => {
    weightStore.setWeightEntries(parseWeightRecords(snapshot))
  })

  return weightUnsubscribe
}

export async function addWeight(value: number, createdAt?: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Вес должен быть положительным числом')
  }

  const timestamp = Number.isFinite(createdAt) && (createdAt as number) > 0
    ? Number(createdAt)
    : Date.now()

  await createData(WEIGHTS_PATH, {
    value: Number(value.toFixed(1)),
    createdAt: timestamp,
  })
}

export async function removeWeight(id: string) {
  if (!id) throw new Error('Не указан идентификатор записи веса')
  await removeData(`${WEIGHTS_PATH}/${id}`)
}
