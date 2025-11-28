import { onAuthStateChanged } from 'firebase/auth'
import { auth, createDataWithoutKey } from './firebaseInit'

export const initUser = async () => {
  const router = useRouter()
  const route = useRoute()
  const activeUser = useActiveUser()

  onAuthStateChanged(auth, (user) => {
    if (user) {
      activeUser.value.uid = user.uid
      getUserData()
      
      setTimeout(() => {
        if (!activeUser.value.name && !activeUser.value.email) createUserData()
      }, 3000)

      getAllExercises()
      if (route.name === 'login') router.push('/')
    } else {
      router.push('/login')
    }
  })
}

export const getUserData = () => {
  const activeUser = useActiveUser()

  onData('user', (snapshot:any) => {
    const data = snapshot.val()
    activeUser.value.name = data?.name || ''
    activeUser.value.email = data?.email || ''
    activeUser.value.photoURL = data?.photoURL || ''
  })

  console.log('Получен');
}

export const createUserData = () => {
  console.log('Создан');
  
  createDataWithoutKey('user', {
    name: auth.currentUser?.displayName,
    email: auth.currentUser?.email,
    photoURL: auth.currentUser?.photoURL
  })
}