import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth, updateData, clearOfflineUserData } from './firebaseInit'

let authUnsubscribe: (() => void) | null = null
let userUnsubscribe: (() => void) | null = null
let createUserTimeout: ReturnType<typeof setTimeout> | null = null
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
  const weightStore = useWeightStore()
  userStore.activeUser.uid = ''
  userStore.activeUser.name = ''
  userStore.activeUser.email = ''
  userStore.activeUser.photoURL = ''
  userStore.activeUser.status = defaultStatus
  catalogStore.setRubbersFromUser(null)
  weightStore.setWeightEntries([])
}

function stopUserDataSubscription() {
  if (!userUnsubscribe) return
  userUnsubscribe()
  userUnsubscribe = null
}

export const initUser = () => {
  if (authUnsubscribe) return authUnsubscribe

  const auth = getFirebaseAuth()
  const userStore = useUserStore()
  const exerciseStore = useExerciseStore()
  const workoutStore = useWorkoutStore()

  try {
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      const previousUid = userStore.activeUser.uid

      if (user) {
        if (previousUid && previousUid !== user.uid) {
          clearOfflineUserData(previousUid)
        }

        userStore.activeUser.uid = user.uid
        getUserData()

        if (createUserTimeout) clearTimeout(createUserTimeout)
        createUserTimeout = setTimeout(() => {
          if (!userStore.activeUser.name && !userStore.activeUser.email) void createUserData()
        }, 3000)

        getAllExercises()
      } else {
        if (createUserTimeout) {
          clearTimeout(createUserTimeout)
          createUserTimeout = null
        }

        clearOfflineUserData(previousUid)

        stopUserDataSubscription()
        stopAllExercisesSubscription()
        stopWorkoutsSubscription()
        resetActiveUserState()
        exerciseStore.allExercises = []
        exerciseStore.activeExercise = null
        exerciseStore.selectUpdateExercise = null
        workoutStore.workouts = []
        workoutStore.filteredWorkouts = []
        workoutStore.selectUpdateWorkout = null
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
