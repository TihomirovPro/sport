<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { getFirebaseAuth } from '~/composables/firebaseInit'
import { prepareLogout } from '~/composables/useUser'
import { stopWeightSubscription, subscribeWeights } from '~/composables/useWeight'
import packageJson from '~/package.json'
import { IDB_KEYS } from '~/composables/storage/keys'
import { idbStorage } from '~/composables/storage/idb'

definePageMeta({
  backTo: '/'
})

useHead({
  title: 'Настройки',
})

const appStore = useAppStore()
const catalogStore = useCatalogStore()
const userStore = useUserStore()
const weightStore = useWeightStore()
const { hideFilterTitles } = storeToRefs(appStore)
const { rubbersColor } = storeToRefs(catalogStore)
const { activeUser } = storeToRefs(userStore)
const { lastWeight } = storeToRefs(weightStore)
const router = useRouter()
const colorMode = useColorMode()
const baseColor = ref('rgb(var(--colorAccent))')
const showModalColor = ref(false)
const showModalRubbers = ref(false)
const appVersion = packageJson.version || 'dev'

const storedBaseColor = idbStorage.getItem(IDB_KEYS.BASE_COLOR)
if (storedBaseColor) baseColor.value = storedBaseColor

appStore.headerTitle = 'Настройки'

onMounted(() => {
  subscribeWeights()
})

onUnmounted(() => {
  stopWeightSubscription()
})

const lastWeightText = computed(() => {
  if (!lastWeight.value) return 'Нет данных'
  return `${lastWeight.value.value.toFixed(1).replace('.', ',')} кг`
})

function selectColor(color: string) {
  showModalColor.value = false

  baseColor.value = color
  idbStorage.setItem(IDB_KEYS.BASE_COLOR, color)

  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  const html = document.querySelector('html')
  if (!html) return
  html.style.setProperty('--colorAccent', `${r} ${g} ${b}`)
}

function changeTheme() {
  if (colorMode.preference === 'dark') colorMode.preference = 'light'
  else colorMode.preference = 'dark'
}

function toWeightPage() {
  void router.push('/weight')
}

function confirmSignOut() {
  if (!process.client) return
  if (!window.confirm('Выйти из аккаунта?')) return
  void signOutUser()
}

async function signOutUser() {
  try {
    prepareLogout()
    const auth = getFirebaseAuth()
    await signOut(auth)
    await navigateTo('/login')
  } catch (error) {
    console.error('[firebase:signOutUser]', error)
  }
}
</script>

<template lang="pug">
.flex.flex-col.gap-3.h-full
  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="changeTheme")
    p Тема
    p {{ colorMode.preference }}


  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="showModalColor = true")
    p основной цвет
    .size-9.rounded(:style="`background: ${baseColor}`")

  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="hideFilterTitles = !hideFilterTitles")
    p Скрыть заголовки фильтров
    p {{ hideFilterTitles ? 'Да' : 'Нет' }}

  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="showModalRubbers = true")
    p Набор резин
    p {{ rubbersColor.length }} шт

  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="toWeightPage")
    p Мой вес
    p {{ lastWeightText }}

  .flex.items-center.justify-between.border-b.border-faint.py-2
    p Статус
    p {{ activeUser.status || 'Пользователь' }}

  .flex.justify-between.mt-auto
    .py-2(@click="confirmSignOut") Выход
    .py-2 v {{ appVersion }}

  ModalColor(
    :isShow="showModalColor"
    :activeColor="baseColor"
    @hiden="showModalColor = false"
    @selectColor="selectColor"
  )
  ModalRubbers(
    :isShow="showModalRubbers"
    @hiden="showModalRubbers = false"
  )
</template>
