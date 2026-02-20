import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { getFirebaseAuth } from '~/composables/firebaseInit'

const publicRouteNames = new Set(['login'])
const AUTH_RESOLVE_TIMEOUT_MS = 2500

function resolveAuthUser() {
  const auth = getFirebaseAuth()

  if (auth.currentUser) return Promise.resolve(auth.currentUser)

  return new Promise<User | null>((resolve) => {
    let settled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let unsubscribe: () => void = () => {}

    const finish = (user: User | null) => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      unsubscribe()
      resolve(user)
    }

    timer = setTimeout(() => {
      finish(auth.currentUser ?? null)
    }, AUTH_RESOLVE_TIMEOUT_MS)

    unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        finish(user)
      },
      () => {
        finish(auth.currentUser ?? null)
      }
    )
  })
}

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()
  const routeName = String(to.name ?? '')
  const user = await resolveAuthUser()
  const isPublicRoute = publicRouteNames.has(routeName)

  if (user) {
    userStore.activeUser.uid = user.uid

    if (isPublicRoute) {
      return navigateTo('/')
    }

    return
  }

  userStore.activeUser.uid = ''

  if (process.client && !navigator.onLine) {
    return
  }

  if (!isPublicRoute) {
    return navigateTo('/login')
  }
})
