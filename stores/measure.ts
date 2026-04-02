export interface MeasureType {
  id: string
  name: string
  unit: string
}

export interface MeasureEntry {
  id: string
  typeId: string
  value: number
  createdAt: number
}

export const useMeasureStore = defineStore('measure', () => {
  const types = ref<MeasureType[]>([])
  const entriesByType = ref<Record<string, MeasureEntry[]>>({})
  const activeType = ref<MeasureType | null>(null)

  const activeEntries = computed(() =>
    activeType.value ? (entriesByType.value[activeType.value.id] ?? []) : []
  )

  function setTypes(next: MeasureType[]) {
    types.value = next
  }

  function setEntries(typeId: string, entries: MeasureEntry[]) {
    entriesByType.value = { ...entriesByType.value, [typeId]: entries }
  }

  return {
    types,
    entriesByType,
    activeType,
    activeEntries,
    setTypes,
    setEntries,
  }
})
