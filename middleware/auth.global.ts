import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '~/composables/firebaseInit'

const publicRouteNames = new Set(['login'])

function resolveAuthUser() {
  const auth = getFirebaseAuth()

  if (auth.currentUser) return Promise.resolve(auth.currentUser)

  return new Promise<typeof auth.currentUser>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
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

  if (!isPublicRoute) {
    return navigateTo('/login')
  }
})
