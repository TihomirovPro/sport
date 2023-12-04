import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth'

export const signOutUser = async () => {
  const auth = getAuth()
  await signOut(auth)
}

export const signInWithGoogle = () => {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()

  signInWithPopup(auth, provider)
}

export const initUser = async () => {
  const router = useRouter()
  const route = useRoute()
  const auth = getAuth()
  const activeUser = useActiveUser()

  onAuthStateChanged(auth, (user) => {    
    if (user) {
      const uid = user.uid
      activeUser.value = uid
    
      getAllExercises(uid)
      if (route.name === 'login') router.push('/')
    } else {
      router.push('/login')
    }
  })
}