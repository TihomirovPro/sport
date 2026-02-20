export const useAppStore = defineStore('app', () => {
  const headerTitle = ref('Упражнения')
  const hideFilterTitles = ref(false)

  return {
    headerTitle,
    hideFilterTitles,
  }
})
