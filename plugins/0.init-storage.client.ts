import { initIdbStorage } from '~/composables/storage/idb'

export default defineNuxtPlugin(async () => {
  await initIdbStorage()
})
