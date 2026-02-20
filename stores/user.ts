interface ActiveUser {
  uid: string
  name: string
  email: string
  photoURL: string
}

export const useUserStore = defineStore('user', () => {
  const activeUser = ref<ActiveUser>({
    uid: '',
    name: '',
    email: '',
    photoURL: ''
  })

  return {
    activeUser,
  }
})
