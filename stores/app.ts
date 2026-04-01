import { IDB_KEYS } from '~/composables/storage/keys'
import { idbStorage } from '~/composables/storage/idb'

export const useAppStore = defineStore('app', () => {
  const HIDE_FILTER_TITLES_KEY = IDB_KEYS.HIDE_FILTER_TITLES
  const headerTitle = ref('Упражнения')
  const hideFilterTitles = ref(false)

  if (process.client) {
    const storedValue = idbStorage.getItem(HIDE_FILTER_TITLES_KEY)

    if (storedValue !== null) {
      try {
        hideFilterTitles.value = Boolean(JSON.parse(storedValue))
      } catch {
        hideFilterTitles.value = storedValue === 'true'
      }
    }

    watch(hideFilterTitles, (value) => {
      idbStorage.setItem(HIDE_FILTER_TITLES_KEY, JSON.stringify(value))
    })
  }

  return {
    headerTitle,
    hideFilterTitles,
  }
})
