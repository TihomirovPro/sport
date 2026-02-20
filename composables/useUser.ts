import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth, createDataWithoutKey, clearOfflineUserData } from './firebaseInit'

let authUnsubscribe: (() => void) | null = null
let userUnsubscribe: (() => void) | null = null
let createUserTimeout: ReturnType<typeof setTimeout> | null = null
type UserData = {
  name?: string
  email?: string
  photoURL?: string
  rubbersColor?: unknown
}

function resetActiveUserState() {
  const userStore = useUserStore()
  const catalogStore = useCatalogStore()
  userStore.activeUser.uid = ''
  userStore.activeUser.name = ''
  userStore.activeUser.email = ''
  userStore.activeUser.photoURL = ''
  catalogStore.setRubbersFromUser(null)
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
      userStore.activeUser.name = data?.name || ''
      userStore.activeUser.email = data?.email || ''
      userStore.activeUser.photoURL = data?.photoURL || ''
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
    await createDataWithoutKey('user', {
      name: auth.currentUser?.displayName,
      email: auth.currentUser?.email,
      photoURL: auth.currentUser?.photoURL
    })
  } catch (error) {
    console.error('[firebase:createUserData]', error)
  }
}
