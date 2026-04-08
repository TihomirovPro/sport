import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '~/shared/api/firebase/client'
import { clearOfflineUserData } from '~/shared/api/firebase/offlineQueue'
import { updateData } from '~/shared/api/firebaseInit'
import { clearLastAuthUid, readLastAuthUid, writeLastAuthUid } from '~/shared/api/firebase/authSession'

let authUnsubscribe: (() => void) | null = null
let userUnsubscribe: (() => void) | null = null
let createUserTimeout: ReturnType<typeof setTimeout> | null = null
// Флаг явного выхода: на iOS navigator.onLine ненадёжен (см. shared/api/platform/ios.ts),
// поэтому onAuthStateChanged(null) при холодном старте нельзя трактовать как реальный логаут.
let intentionalLogout = false

export type InitUserCallbacks = {
  onLogin: () => void
  onLogout: () => void
}

export function prepareLogout() {
  intentionalLogout = true
  clearLastAuthUid()
}
type UserData = {
  name?: string
  email?: string
  photoURL?: string
  status?: string
  rubbersColor?: unknown
}

const defaultStatus = 'user'

function resetActiveUserState() {
  const userStore = useUserStore()
  const catalogStore = useCatalogStore()
  userStore.activeUser.uid = ''
  userStore.activeUser.name = ''
  userStore.activeUser.email = ''
  userStore.activeUser.photoURL = ''
  userStore.activeUser.status = defaultStatus
  catalogStore.setRubbersFromUser(null)
}

function stopUserDataSubscription() {
  if (!userUnsubscribe) return
  userUnsubscribe()
  userUnsubscribe = null
}

export const initUser = (callbacks: InitUserCallbacks) => {
  if (authUnsubscribe) return authUnsubscribe

  const auth = getFirebaseAuth()
  const userStore = useUserStore()

  // Немедленно загружаем данные из кэша, не дожидаясь onAuthStateChanged.
  // На iOS navigator.onLine ненадёжен (см. shared/api/platform/ios.ts): Firebase пытается
  // обновить токен по сети и это может занять > 2500ms (таймаут middleware).
  // Предзагрузка из кэша устраняет пустой экран при холодном старте.
  if (process.client) {
    const preloadUid = readLastAuthUid()
    if (preloadUid) {
      userStore.activeUser.uid = preloadUid
      getUserData()
      callbacks.onLogin()
    }
  }

  try {
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      const previousUid = userStore.activeUser.uid
      const rememberedUid = readLastAuthUid()
      const offlineUid = previousUid || rememberedUid
      // navigator.onLine ненадёжен на iOS (см. shared/api/platform/ios.ts) —
      // используем явный флаг intentionalLogout.
      const shouldKeepOfflineSession = !intentionalLogout && !!offlineUid

      if (user) {
        writeLastAuthUid(user.uid)

        if (previousUid && previousUid !== user.uid) {
          clearOfflineUserData(previousUid)
        }

        userStore.activeUser.uid = user.uid
        getUserData()

        if (createUserTimeout) clearTimeout(createUserTimeout)
        createUserTimeout = setTimeout(() => {
          if (!userStore.activeUser.name && !userStore.activeUser.email) void createUserData()
        }, 3000)

        callbacks.onLogin()
      } else {
        if (shouldKeepOfflineSession) {
          userStore.activeUser.uid = offlineUid
          writeLastAuthUid(offlineUid)
          getUserData()
          callbacks.onLogin()
          return
        }

        intentionalLogout = false
        clearLastAuthUid()

        if (createUserTimeout) {
          clearTimeout(createUserTimeout)
          createUserTimeout = null
        }

        clearOfflineUserData(previousUid)

        stopUserDataSubscription()
        resetActiveUserState()
        callbacks.onLogout()
      }
    })
  } catch (error) {
    console.error('[firebase:initUser]', error)
  }

  return authUnsubscribe
}

export const getUserData = () => {
  const userStore = useUserStore()
  const catalogStore = useCatalogStore()

  try {
    stopUserDataSubscription()

    userUnsubscribe = onData('user', (snapshot) => {
      const data = snapshot.val() as UserData | null
      const status = String(data?.status ?? '').trim()

      userStore.activeUser.name = data?.name || ''
      userStore.activeUser.email = data?.email || ''
      userStore.activeUser.photoURL = data?.photoURL || ''
      userStore.activeUser.status = status || defaultStatus
      catalogStore.setRubbersFromUser(data?.rubbersColor)
    })
  } catch (error) {
    console.error('[firebase:getUserData]', error)
  }

  return userUnsubscribe
}

export const createUserData = async () => {
  const auth = getFirebaseAuth()

  try {
    await updateData('user', {
      name: auth.currentUser?.displayName ?? '',
      email: auth.currentUser?.email ?? '',
      photoURL: auth.currentUser?.photoURL ?? ''
    })
  } catch (error) {
    console.error('[firebase:createUserData]', error)
  }
}
