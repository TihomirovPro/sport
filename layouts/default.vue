<script setup>
onMounted(async () => {
  initUser()
})

const user = useActiveUser()
</script>

<template lang="pug">
.page
  Header(v-if="user")

  .page__content
    slot
  Footer(v-if="user")
  Menu
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

<style lang="stylus">
.page
  display grid
  grid-template-rows 50px 1fr
  height 100%

  &__content
    height 100%
    padding-bottom 80px
    overflow auto
</style>
