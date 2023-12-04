<script setup>
onMounted(async () => {
  initUser()
})
</script>

<template lang="pug">
.flex-center.h-full
  .h-full.overflow-auto
    slot
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