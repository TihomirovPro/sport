<script setup lang="ts">
const route = useRoute()
const user = useActiveUser()

onMounted(async () => {
  initUser()
})

const isShowMenu = computed(()=> {
  if (route.name === 'exercise-item' || route.name === 'index') return true
  return false
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
  v-if="user"
  class="grid-rows-[56px_1fr]"
)
  Header

  main.px-2.py-3.max-w-2xl.size-full.mx-auto
    slot

  Menu(v-if="isShowMenu")
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