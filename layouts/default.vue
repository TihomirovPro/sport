<script setup lang="ts">
const route = useRoute()
const user = useActiveUser()

onMounted(async () => {
  initUser()
})

const isShowFooter = computed(()=> {
  if (route.name === 'exercise' || route.name === 'workout') return false
  return true
})

</script>

<template lang="pug">
.flex.flex-col.min-h-full(v-if="user")
  Header

  main.px-2.py-3.max-w-2xl.size-full.mx-auto
    slot

  Footer(v-if="isShowFooter")
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