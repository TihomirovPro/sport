<script setup lang="ts">
import { storeToRefs } from 'pinia'

const route = useRoute()
const userStore = useUserStore()
const { activeUser } = storeToRefs(userStore)

onMounted(async () => {
  initUser()
})

if (localStorage.getItem('baseColor')) {
  const color = localStorage.getItem('baseColor')

  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  const html = document.querySelector('html')
  html.style.setProperty('--colorAccent', `${r} ${g} ${b}`)
}

</script>

<template lang="pug">
.grid.min-h-full(
  v-if="activeUser"
  class="grid-rows-[auto_1fr]"
)
  PwaInstall
  Header

  main.px-2.py-3.max-w-2xl.size-full.mx-auto.relative
    slot
  GlobalNotifications
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
