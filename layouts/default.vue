<script setup lang="ts">
onMounted(async () => {
  initUser()
})

const user = useActiveUser()
</script>

<template lang="pug">
.h-full
  Header(v-if="user")

  .h-full.pb-24.overflow-auto.max-w-2xl.mx-auto
    slot

  Footer(v-if="user")
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