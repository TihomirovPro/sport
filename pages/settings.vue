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

const isDark = computed(() => colorMode.preference === 'dark')

const userInitial = computed(() => {
  const name = activeUser.value.name || activeUser.value.email
  return name ? name[0].toUpperCase() : '?'
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
.flex.flex-col.gap-5.pb-6

  //- Profile card
  .flex.items-center.gap-3.px-1.py-3
    .size-14.rounded-2xl.flex-center.text-white.text-2xl.font-semibold.shrink-0(
      :style="`background: ${baseColor}`"
    ) {{ userInitial }}
    .flex.flex-col.gap-1.min-w-0
      p.text-base.font-medium.truncate {{ activeUser.name || activeUser.email || 'Пользователь' }}
      .flex.items-center.gap-1
        .size-2.rounded-full.bg-green
        p.text-sm.opacity-50 {{ activeUser.status || 'Пользователь' }}

  //- Section: Appearance
  .flex.flex-col.gap-1
    p.text-xs.font-semibold.uppercase.opacity-40.px-1.pb-1 Внешний вид
    .flex.flex-col.rounded-xl.overflow-hidden.border.border-faint

      //- Theme
      .flex.items-center.justify-between.px-4.py-3.cursor-pointer(
        @click="changeTheme"
      )
        .flex.items-center.gap-3
          .size-8.rounded-lg.flex-center.bg-faint.opacity-80
            svg(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
              circle(cx="12" cy="12" r="5")
              line(x1="12" y1="1" x2="12" y2="3")
              line(x1="12" y1="21" x2="12" y2="23")
              line(x1="4.22" y1="4.22" x2="5.64" y2="5.64")
              line(x1="18.36" y1="18.36" x2="19.78" y2="19.78")
              line(x1="1" y1="12" x2="3" y2="12")
              line(x1="21" y1="12" x2="23" y2="12")
              line(x1="4.22" y1="19.78" x2="5.64" y2="18.36")
              line(x1="18.36" y1="5.64" x2="19.78" y2="4.22")
          span.text-sm Тёмная тема
        BaseToggle(:modelValue="isDark" :activeColor="baseColor" @update:modelValue="changeTheme")

      .h-px.bg-faint.mx-4

      //- Accent color
      .flex.items-center.justify-between.px-4.py-3.cursor-pointer(
        @click="showModalColor = true"
      )
        .flex.items-center.gap-3
          .size-8.rounded-lg.flex-center.bg-faint.opacity-80
            svg(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
              circle(cx="13.5" cy="6.5" r=".5" fill="currentColor")
              circle(cx="17.5" cy="10.5" r=".5" fill="currentColor")
              circle(cx="8.5" cy="7.5" r=".5" fill="currentColor")
              circle(cx="6.5" cy="12.5" r=".5" fill="currentColor")
              path(d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z")
          span.text-sm Акцентный цвет
        .flex.items-center.gap-2
          .size-6.rounded-full.shadow-sm.border.border-white.border-opacity-30(
            :style="`background: ${baseColor}`"
          )
          svg.opacity-40(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
            polyline(points="9 18 15 12 9 6")

  //- Section: Workouts
  .flex.flex-col.gap-1
    p.text-xs.font-semibold.uppercase.opacity-40.px-1.pb-1 Тренировки

    .flex.flex-col.rounded-xl.overflow-hidden.border.border-faint

      //- Hide filter titles
      .flex.items-center.justify-between.px-4.py-3.cursor-pointer(
        @click="hideFilterTitles = !hideFilterTitles"
      )
        .flex.items-center.gap-3
          .size-8.rounded-lg.flex-center.bg-faint.opacity-80
            svg(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
              line(x1="8" y1="6" x2="21" y2="6")
              line(x1="8" y1="12" x2="21" y2="12")
              line(x1="8" y1="18" x2="21" y2="18")
              line(x1="3" y1="6" x2="3.01" y2="6")
              line(x1="3" y1="12" x2="3.01" y2="12")
              line(x1="3" y1="18" x2="3.01" y2="18")
          span.text-sm Скрыть заголовки фильтров
        BaseToggle(v-model="hideFilterTitles" :activeColor="baseColor")

      .h-px.bg-faint.mx-4

      //- Rubbers
      .flex.items-center.justify-between.px-4.py-3.cursor-pointer(
        @click="showModalRubbers = true"
      )
        .flex.items-center.gap-3
          .size-8.rounded-lg.flex-center.bg-faint.opacity-80
            svg(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
              path(d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z")
          span.text-sm Набор резин
        .flex.items-center.gap-2
          span.text-sm.opacity-50 {{ rubbersColor.length }} шт
          svg.opacity-40(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
            polyline(points="9 18 15 12 9 6")

  //- Section: Profile
  .flex.flex-col.gap-1
    p.text-xs.font-semibold.uppercase.opacity-40.px-1.pb-1 Профиль

    .flex.flex-col.rounded-xl.overflow-hidden.border.border-faint

      //- Weight
      .flex.items-center.justify-between.px-4.py-3.cursor-pointer(
        @click="toWeightPage"
      )
        .flex.items-center.gap-3
          .size-8.rounded-lg.flex-center.bg-faint.opacity-80
            svg(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
              path(d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z")
          span.text-sm Мой вес
        .flex.items-center.gap-2
          span.text-sm.opacity-50 {{ lastWeightText }}
          svg.opacity-40(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
            polyline(points="9 18 15 12 9 6")

  //- Sign out
  button.w-full.py-3.rounded-xl.text-sm.font-medium.border.border-error.text-error.transition-opacity.active_opacity-60(
    @click="confirmSignOut"
  ) Выйти из аккаунта

  //- Version
  p.text-center.text-xs.opacity-30 версия {{ appVersion }}

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
