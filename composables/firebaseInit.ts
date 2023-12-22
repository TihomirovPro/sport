import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
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

const config = useRuntimeConfig()

const firebaseConfig:firebaseConfig = {
  apiKey: config.public.FIREBASE_API_KEY,
  authDomain: config.public.AUTH_DOMAIN,
  databaseURL: config.public.DATABASE_URL,
  projectId: config.public.PROJECT_ID,
  storageBucket: config.public.STORAGE_BUCKET,
  messagingSenderId: config.public.MESSAGING_SENDER_ID,
  appId: config.public.APP_ID
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getDatabase(firebaseApp)
export const auth = getAuth(firebaseApp)

export function dbPath(path:string):string {
  const userID = auth.currentUser?.uid
  return `users/${userID}/${path}`
}

export const createData = (path:string, data:any) => {
  const key = push(child(ref(db), path)).key
  set(ref(db, dbPath(`${path}/${key}`)), data)
}

export const updateData = (path:string, data:any) => update(ref(db, dbPath(path)), data)
export const removeData = (path:string) => remove(ref(db, dbPath(path)))
export const onData = (path:string, callback:any) => onValue(ref(db, dbPath(path)), callback)


