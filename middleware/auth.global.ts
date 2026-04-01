import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { readLastAuthUid } from '~/composables/firebase/authSession'
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
  const isPublicRoute = publicRouteNames.has(routeName)
  const auth = getFirebaseAuth()
  const rememberedUid = readLastAuthUid()
  const offlineRememberedUser = process.client && !navigator.onLine && !auth.currentUser && !!rememberedUid

  if (!isPublicRoute && userStore.activeUser.uid) return

  // Если uid уже выставлен (например, из preload в initUser) и мы на публичной странице — редиректим
  if (isPublicRoute && userStore.activeUser.uid) return navigateTo('/')

  if (isPublicRoute && offlineRememberedUser) {
    userStore.activeUser.uid = rememberedUid
    return navigateTo('/')
  }

  if (isPublicRoute && !auth.currentUser && !userStore.activeUser.uid && !offlineRememberedUser && !rememberedUid) return

  const user = await resolveAuthUser()

  if (user) {
    userStore.activeUser.uid = user.uid

    if (isPublicRoute) {
      return navigateTo('/')
    }

    return
  }

  // Fallback для офлайн-режима: iOS врёт про navigator.onLine при холодном старте,
  // поэтому проверяем rememberedUid независимо от navigator.onLine
  if (rememberedUid) {
    userStore.activeUser.uid = rememberedUid

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
