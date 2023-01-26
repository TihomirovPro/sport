import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    
    const firebaseConfig = {
        apiKey: config.FIREBASE_API_KEY,
        authDomain: config.AUTH_DOMAIN,
        databaseURL: config.DATABASE_URL,
        projectId: config.PROJECT_ID,
        storageBucket: config.STORAGE_BUCKET,
        messagingSenderId: config.MESSAGING_SENDER_ID,
        appId: config.APP_ID
      };

    const app = initializeApp(firebaseConfig)
  })