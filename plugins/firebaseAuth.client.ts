import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.FIREBASE_API_KEY,
    authDomain: config.public.AUTH_DOMAIN,
    databaseURL: config.public.DATABASE_URL,
    projectId: config.public.PROJECT_ID,
    storageBucket: config.public.STORAGE_BUCKET,
    messagingSenderId: config.public.MESSAGING_SENDER_ID,
    appId: config.public.APP_ID
  }

  const app = initializeApp(firebaseConfig)
})