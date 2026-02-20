import { removeData, updateData } from '~/composables/firebaseInit'

export const useCatalogStore = defineStore('catalog', () => {
  const settings = ref<[]>([])

  type RubberItem = {
    name: string
    color: string
  }

  const defaultRubbersColor: RubberItem[] = [
    { name: 'Розовая резина', color: 'rgb(236, 72, 153)' },
    { name: 'Желтая резина', color: 'rgb(250, 204, 21)' },
    { name: 'Оранжевая резина', color: 'rgb(249, 115, 22)' },
    { name: 'Черная резина', color: 'rgb(64, 64, 64)' },
    { name: 'Филетовая резина', color: 'rgb(126, 34, 206)' },
    { name: 'Зеленая резина', color: 'rgb(22, 163, 74)' },
    { name: 'Синяя резина', color: 'rgb(29, 78, 216)' }
  ]

  function normalizeRubbers(value: unknown): RubberItem[] {
    if (!Array.isArray(value)) return []

    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const rawName = String((item as RubberItem).name ?? '').trim()
        const rawColor = String((item as RubberItem).color ?? '').trim()
        if (!rawName || !rawColor) return null
        return {
          name: rawName,
          color: rawColor,
        }
      })
      .filter((item): item is RubberItem => Boolean(item))
  }

  function defaultRubbers(): RubberItem[] {
    return [...defaultRubbersColor]
  }

  const rubbersColor = ref<RubberItem[]>(defaultRubbers())
  const rubbers = computed(() => rubbersColor.value.map((item) => item.name))

  function setRubbersFromUser(value: unknown) {
    const normalized = normalizeRubbers(value)
    rubbersColor.value = normalized.length ? normalized : defaultRubbers()
  }

  async function saveRubbers(items: RubberItem[]) {
    const normalized = normalizeRubbers(items)
    rubbersColor.value = normalized.length ? normalized : defaultRubbers()
    await updateData('user', {
      rubbersColor: rubbersColor.value,
    })
  }

  async function resetRubbers() {
    rubbersColor.value = defaultRubbers()
    await removeData('user/rubbersColor')
  }

  const icons = ref([
    'push-up', 'push-up-1',
    'bars', 'bars-1',
    'rings',
    'pull-up', 'pull-up-1', 'pull-up-2', 'pull-up-3',
    'deadlift',
    'squats',
    'bench-press',
    'standing-barbell-press',
    'kettlebell', 'kettlebell-1',
    'situps',
  ])

  const colors = ref([
    '#f87171', '#fb7185', '#f43f5e', '#ef4444', '#dc2626', '#b91c1c',
    '#e879f9', '#f472b6', '#ec4899', '#d946ef', '#c026d3', '#a21caf',

    '#c084fc', '#a78bfa', '#8b5cf6', '#a855f7', '#9333ea', '#7e22ce',
    '#60a5fa', '#818cf8', '#3b82f6', '#6366f1', '#7c3aed', '#6d28d9',

    '#0284c7', '#0369a1', '#2563eb', '#1d4ed8', '#4f46e5', '#4338ca',
    '#38bdf8', '#0ea5e9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490',

    '#2dd4bf', '#14b8a6', '#059669', '#047857', '#34d399', '#10b981',
    '#0d9488', '#0f766e', '#16a34a', '#15803d', '#4ade80', '#22c55e',

    '#a3e635', '#84cc16', '#fbbf24', '#f59e0b', '#ca8a04', '#a16207',
    '#65a30d', '#4d7c0f', '#facc15', '#eab308', '#d97706', '#b45309',

    '#fb923c', '#f97316', '#a3a3a3', '#737373', '#94a3b8', '#64748b',
    '#ea580c', '#c2410c', '#525252', '#404040', '#475569', '#334155'
  ])

  return {
    settings,
    rubbers,
    rubbersColor,
    setRubbersFromUser,
    saveRubbers,
    resetRubbers,
    icons,
    colors,
  }
})
