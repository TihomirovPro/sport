<script setup>
onMounted(async () => {
  initUser()
})

const route = useRoute()
const user = useActiveUser()

const backBtn = ref(false)

const pageName = () => {
  if (route.name === 'index') {
    backBtn.value = false
    return 'Упражнения'
  } else if (route.name === 'settings') {
    backBtn.value = true
    return 'Настройки'
  } else if (route.name === 'measure') {
    backBtn.value = true
    return 'Замеры'
  } else if (route.name === 'profile') {
    backBtn.value = true
    return 'Профиль'
  } else {
    backBtn.value = true
    return route.params.name
  }
}
</script>

<template lang="pug">
.page
  Header(
    v-if="user"
    :title="pageName()"
    :backBtn="backBtn"
  )
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
  grid-template-rows 50px 1fr 50px
  height 100%

  &__content
    height 100%
    overflow auto
</style>