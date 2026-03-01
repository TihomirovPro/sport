import { initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

let firebaseApp: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null

function getFirebaseConfig(): FirebaseConfig {
  const config = useRuntimeConfig()

  return {
    apiKey: config.public.FIREBASE_API_KEY,
    authDomain: config.public.AUTH_DOMAIN,
    databaseURL: config.public.DATABASE_URL,
    projectId: config.public.PROJECT_ID,
    storageBucket: config.public.STORAGE_BUCKET,
    messagingSenderId: config.public.MESSAGING_SENDER_ID,
    appId: config.public.APP_ID
  }
}

function ensureFirebaseInit() {
  if (firebaseApp && db && auth) return

  firebaseApp = initializeApp(getFirebaseConfig())
  db = getDatabase(firebaseApp)
  auth = getAuth(firebaseApp)
}

export const getFirebaseApp = () => {
  ensureFirebaseInit()
  return firebaseApp as FirebaseApp
}

export const getFirebaseDb = () => {
  ensureFirebaseInit()
  return db as Database
}

export const getFirebaseAuth = () => {
  ensureFirebaseInit()
  return auth as Auth
}

export function dbPath(path: string): string {
  const userID = getFirebaseAuth().currentUser?.uid
  if (!userID) throw new Error('Пользователь не авторизован')
  return `users/${userID}/${path}`
}

export function logFirebaseError(operation: string, error: unknown) {
  console.error(`[firebase:${operation}]`, error)
}
