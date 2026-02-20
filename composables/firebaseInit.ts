import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import type { FirebaseApp } from 'firebase/app'
import type { DataSnapshot, Database } from 'firebase/database'
import { child, getDatabase, onValue, ref, remove, set, update, push } from 'firebase/database'

interface firebaseConfig {
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

function getFirebaseConfig(): firebaseConfig {
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

export function dbPath(path:string):string {
  const userID = getFirebaseAuth().currentUser?.uid
  if (!userID) throw new Error('Пользователь не авторизован')
  return `users/${userID}/${path}`
}

function logFirebaseError(operation:string, error:unknown) {
  console.error(`[firebase:${operation}]`, error)
}

export const createData = async <T>(path:string, data:T) => {
  try {
    const key = push(child(ref(getFirebaseDb()), path)).key
    if (!key) throw new Error('Не удалось создать ключ записи')
    await set(ref(getFirebaseDb(), dbPath(`${path}/${key}`)), data)
    return key
  } catch (error) {
    logFirebaseError('createData', error)
    throw error
  }
}

export const createDataWithoutKey = async <T>(path:string, data:T) => {
  try {
    await set(ref(getFirebaseDb(), dbPath(path)), data)
  } catch (error) {
    logFirebaseError('createDataWithoutKey', error)
    throw error
  }
}

export const updateData = async <T>(path:string, data:T) => {
  try {
    await update(ref(getFirebaseDb(), dbPath(path)), data)
  } catch (error) {
    logFirebaseError('updateData', error)
    throw error
  }
}

export const removeData = async (path:string) => {
  try {
    await remove(ref(getFirebaseDb(), dbPath(path)))
  } catch (error) {
    logFirebaseError('removeData', error)
    throw error
  }
}

export const onData = (path:string, callback:(snapshot: DataSnapshot) => void) => {
  try {
    return onValue(
      ref(getFirebaseDb(), dbPath(path)),
      (snapshot) => {
        try {
          callback(snapshot)
        } catch (error) {
          logFirebaseError('onDataCallback', error)
        }
      },
      (error) => logFirebaseError('onData', error)
    )
  } catch (error) {
    logFirebaseError('onDataInit', error)
    return () => {}
  }
}
