<script setup>
onMounted(async () => {
  initUser()
})
</script>

<template lang="pug">
.page
  .page__content
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

<style lang="stylus" scoped>
.page
  display flex
  align-items center
  justify-content center
  height 100%

  &__content
    height 100%
    overflow auto
</style>