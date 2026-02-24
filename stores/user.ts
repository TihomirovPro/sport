interface ActiveUser {
  uid: string
  name: string
  email: string
  photoURL: string
  status: string
}

const defaultStatus = 'user'

export const useUserStore = defineStore('user', () => {
  const activeUser = ref<ActiveUser>({
    uid: '',
    name: '',
    email: '',
    photoURL: '',
    status: defaultStatus,
  })

  return {
    activeUser,
  }
})
