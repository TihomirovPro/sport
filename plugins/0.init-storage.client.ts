import { initIdbStorage } from '~/shared/api/storage/idb'

export default defineNuxtPlugin(async () => {
  await initIdbStorage()
})
