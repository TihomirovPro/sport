import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseInit'

export const initUser = async () => {
  const router = useRouter()
  const route = useRoute()
  const activeUser = useActiveUser()

  onAuthStateChanged(auth, (user) => {
    if (user) {      
      activeUser.value = user.uid
    
      getAllExercises()
      if (route.name === 'login') router.push('/')
    } else {
      router.push('/login')
    }
  })
}