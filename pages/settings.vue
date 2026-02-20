<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { getFirebaseAuth } from '~/composables/firebaseInit'

useHead({
  title: 'Настройки',
})

const appStore = useAppStore()
const catalogStore = useCatalogStore()
const { hideFilterTitles } = storeToRefs(appStore)
const { rubbersColor } = storeToRefs(catalogStore)
const colorMode = useColorMode()
const baseColor = ref('rgb(var(--colorAccent))')
const showModalColor = ref(false)
const showModalRubbers = ref(false)

const storedBaseColor = localStorage.getItem('baseColor')
if (storedBaseColor) baseColor.value = storedBaseColor

appStore.headerTitle = 'Настройки'

function selectColor(color: string) {
  showModalColor.value = false

  baseColor.value = color
  localStorage.setItem('baseColor', color)

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

async function signOutUser() {
  try {
    const auth = getFirebaseAuth()
    await signOut(auth)
    await navigateTo('/login')
  } catch (error) {
    console.error('[firebase:signOutUser]', error)
  }
}
</script>

<template lang="pug">
.grid.gap-3
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

  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="signOutUser")
    p Выход

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
