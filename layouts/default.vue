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
.wrap
  Header(
    v-if="user"
    :title="pageName()"
    :backBtn="backBtn"
  )
  slot
</template>

<style>
.wrap {
  height: 100%;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>