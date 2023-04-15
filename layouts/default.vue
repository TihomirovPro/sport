<script setup>
onMounted(async () => {
  initUser()
})

const route = useRoute()
const user = useActiveUser()

const pageName = () => {
  if (!route.params.name) {
    backBtn.value = false
    return 'Упражнения'
  } else {
    backBtn.value = true
    return route.params.name
  }
}

const titleHeader = ref('Упражнения')
const backBtn = ref(false)
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