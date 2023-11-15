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
  const html = document.querySelector('html')

  html.style.setProperty('--colorAccent', localStorage.getItem('baseColor'))
}

</script>

<template lang="pug">
.flex.flex-col.min-h-full(v-if="user")
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