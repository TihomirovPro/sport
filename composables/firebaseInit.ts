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
  if (!userID) throw new Error('Пользователь не авторизован')
  return `users/${userID}/${path}`
}

function logFirebaseError(operation:string, error:unknown) {
  console.error(`[firebase:${operation}]`, error)
}

export const createData = async (path:string, data:any) => {
  try {
    const key = push(child(ref(db), path)).key
    if (!key) throw new Error('Не удалось создать ключ записи')
    await set(ref(db, dbPath(`${path}/${key}`)), data)
  } catch (error) {
    logFirebaseError('createData', error)
  }
}

export const createDataWithoutKey = async (path:string, data:any) => {
  try {
    await set(ref(db, dbPath(path)), data)
  } catch (error) {
    logFirebaseError('createDataWithoutKey', error)
  }
}

export const updateData = async (path:string, data:any) => {
  try {
    await update(ref(db, dbPath(path)), data)
  } catch (error) {
    logFirebaseError('updateData', error)
  }
}

export const removeData = async (path:string) => {
  try {
    await remove(ref(db, dbPath(path)))
  } catch (error) {
    logFirebaseError('removeData', error)
  }
}

export const onData = (path:string, callback:any) => {
  try {
    return onValue(
      ref(db, dbPath(path)),
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
