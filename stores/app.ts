export const useAppStore = defineStore('app', () => {
  const HIDE_FILTER_TITLES_KEY = 'hideFilterTitles'
  const headerTitle = ref('Упражнения')
  const hideFilterTitles = ref(false)

  if (process.client) {
    const storedValue = localStorage.getItem(HIDE_FILTER_TITLES_KEY)

    if (storedValue !== null) {
      try {
        hideFilterTitles.value = Boolean(JSON.parse(storedValue))
      } catch {
        hideFilterTitles.value = storedValue === 'true'
      }
    }

    watch(hideFilterTitles, (value) => {
      localStorage.setItem(HIDE_FILTER_TITLES_KEY, JSON.stringify(value))
    })
  }

  return {
    headerTitle,
    hideFilterTitles,
  }
})
