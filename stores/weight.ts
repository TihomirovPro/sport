export interface WeightEntry {
  id: string
  value: number
  createdAt: number
}

export const useWeightStore = defineStore('weight', () => {
  const entries = ref<WeightEntry[]>([])
  const lastWeight = computed(() => entries.value[0] || null)

  function setWeightEntries(nextEntries: WeightEntry[]) {
    entries.value = nextEntries
  }

  return {
    entries,
    lastWeight,
    setWeightEntries,
  }
})
