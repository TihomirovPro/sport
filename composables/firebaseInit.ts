import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { child, get, getDatabase, off, onValue, ref, remove, set, update } from 'firebase/database'

export interface firebaseConfig {
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

export const createData = (path:string, data:any) => set(ref(db, dbPath(path)), data)
export const updateData = (path:string, data:any) => update(ref(db, dbPath(path)), data)
export const removeData = (path:string) => remove(ref(db, dbPath(path)))

// export const readData = (path:string) => get(ref(db, path))
// export const readDataOnce = (path:string) => get(child(ref(db), path))
// export const onData = (path:string, callback:any) => onValue(ref(db, path), callback)
// export const offData = (path:string, callback:any) => off(ref(db, path), callback)


