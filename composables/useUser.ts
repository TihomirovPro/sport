import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth'

export const createUser = async (email:string, password:string) => {
  const auth = getAuth()
  const credentials = await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
    })

  return credentials
}

export const signInUser = async (email:string, password:string) => {
  const auth = getAuth()
  const credentials = await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    })

  return credentials
}

export const signOutUser = async () => {
  const auth = getAuth()
  const credentials = await signOut(auth)
    .then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });

  return credentials
}

export const signInWithGoogle = () => {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()

  const credentials = signInWithPopup(auth, provider)
    .then((result) => {
      // console.log(result);
    }).catch((error) => {
      // console.log(error.message);
    })

  return credentials
}

export const initUser = async () => {
  const router = useRouter()
  const route = useRoute()
  const auth = getAuth()
  const activeUser = useActiveUser()

  onAuthStateChanged(auth, (user) => {    
    if (user) {
      const uid = user.uid
      getAllExercises(uid)
      activeUser.value = uid
      if (route.name === 'login') router.push('/')
    } else {
      router.push('/login')
    }
  })
}