<script setup lang="ts">
onMounted(async () => {
  initUser()
})

const user = useActiveUser()
</script>

<template lang="pug">
.flex.flex-col.min-h-full
  Header(v-if="user")

  main.px-2.max-w-2xl.w-full.mx-auto
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