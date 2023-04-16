<script setup>
const isShowMenu = useShowMenu()
const isActiveFilters = useActiveFilters()
const activeExercise = computed(() => { return useActiveExercise() })
const isShowModalExercise = useShowModalExercise()
const isShowModalWorkout = useShowModalWorkout()
const route = useRoute()

watchEffect(() => route)

const changeFilterStatus = () => {
  isActiveFilters.value = !isActiveFilters.value
}

const showModal = () => {
  if (!route.params.name) {
    isShowModalExercise.value = true
  } else {
    isShowModalWorkout.value = true
  }
}
</script>

<template lang="pug">
.footer
  NuxtLink(to="/profile")
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="24" height="24"><path d="M175 171c39 0 70-38 70-85 0-48-10-86-70-86s-70 38-70 86c0 47 31 85 70 85zM42 302c0-3 0-1 0 0zm266 2c0-1 0-5 0 0zM308 298c-1-82-12-105-94-120 0 0-12 15-39 15s-39-15-39-15c-81 14-92 38-94 118v15s20 39 133 39 133-39 133-39a3131 3131 0 0 1 0-13z"/></svg>
  NuxtLink(to="/measure")
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 545 544" width="24" height="24"><path d="M187 198c45 0 82-28 82-62s-37-61-82-61-82 27-82 61 37 62 82 62Zm0-101c33 0 60 18 60 39 0 22-28 40-60 40-33 0-60-18-60-40 0-21 27-39 60-39Zm0 0"/><path d="M534 250H372V136C372 61 289 0 186 0S0 61 0 136v135c0 69 71 126 162 135h2l23 1h347c6 0 11-5 11-11V261c0-6-5-11-11-11ZM187 22c90 0 164 52 164 114 0 63-73 114-164 114S22 199 22 136C22 74 96 22 187 22Zm164 178v50h-63a165 165 0 0 0 62-50Zm172 185h-22v-56a11 11 0 0 0-22 0v56h-44v-30a11 11 0 0 0-21 0v30h-44v-30a11 11 0 0 0-22 0v30h-44v-56a11 11 0 0 0-22 0v56h-42v-30a11 11 0 0 0-22 0v30h-44v-30a11 11 0 0 0-21 0v27C79 371 23 326 23 271v-71c31 43 93 72 164 72h336Zm0 0"/></svg>

  .addBtn(@click="showModal")

  svg(v-if="activeExercise.value" @click="changeFilterStatus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24")
    path(fill="#262626" fill-rule="evenodd" d="M18 12a4 4 0 1 0-3.87-5H3a1 1 0 0 0 0 2h11.13A4 4 0 0 0 18 12zm-2-4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM2 16a4 4 0 0 1 7.87-1H21a1 1 0 1 1 0 2H9.87A4 4 0 0 1 2 16zm6 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0z" clip-rule="evenodd")
  svg(v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24")
    path(fill="#262626" d="M420 92 335 6a21 21 0 0 0-1-1l-1-1h-1l-1-1h-1l-1-1h-1l-1-1h-2l-1-1h-2a21 21 0 0 0-4 0h-2l-1 1h-2l-1 1h-1l-1 1h-1l-1 1h-1l-1 1-1 1-85 86a21 21 0 0 0 30 30l49-49v247a21 21 0 1 0 42 0V73l49 49a21 21 0 0 0 30-30zM262 390l-49 49V192a21 21 0 1 0-42 0v247l-49-49a21 21 0 0 0-30 30l85 86 1 1 1 1h1l1 1h1l1 1h1l1 1h2l1 1h8l1-1h2l1-1h1l1-1h1l1-1h1l1-1 1-1 85-86a21 21 0 0 0-30-30z")
  NuxtLink(to="/settings")
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path fill="#262626" d="M29.2 11.8a4 4 0 0 1-3-5.3 1.8 1.8 0 0 0-.6-2 14.8 14.8 0 0 0-4.4-2.6 1.9 1.9 0 0 0-2.1.6 4 4 0 0 1-6.2 0 1.9 1.9 0 0 0-2-.6 14.8 14.8 0 0 0-4.2 2.3 1.9 1.9 0 0 0-.5 2.2 3.9 3.9 0 0 1-3.3 5.3 1.9 1.9 0 0 0-1.6 1.5A14.1 14.1 0 0 0 1 16a14.3 14.3 0 0 0 .2 2.4 1.9 1.9 0 0 0 1.6 1.5A3.9 3.9 0 0 1 6 25.4a1.8 1.8 0 0 0 .5 2.2A14.9 14.9 0 0 0 11 30a2 2 0 0 0 .6.1 1.8 1.8 0 0 0 1.5-.8 3.9 3.9 0 0 1 3.2-1.6 4 4 0 0 1 3.1 1.5 1.8 1.8 0 0 0 2.2.6 15 15 0 0 0 4-2.4 1.9 1.9 0 0 0 .5-2 3.9 3.9 0 0 1 3.2-5.5 1.9 1.9 0 0 0 1.5-1.5A14.5 14.5 0 0 0 31 16a14.3 14.3 0 0 0-.3-2.7 1.8 1.8 0 0 0-1.5-1.5zM21 16a5 5 0 1 1-5-5 5 5 0 0 1 5 5z"/></svg>

</template>

<style lang="stylus" scoped>
.footer
  position relative
  z-index 100
  display flex
  gap 20px
  align-items center
  justify-content space-around
  height 50px
  background #fff
  box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)

.addBtn
  width 50px
  height 50px
  background #5182dc
  display flex
  align-items center
  justify-content center
  border-radius 50%
  box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)
  transition: .3s
  transform translateY(-30%)

  &.close
    transform: rotate(-45deg)

  &:before
  &:after
    position absolute
    content: ''
    display block
    background #fafafa

  &:before
    width 20px
    height 2px
  &:after
    height 20px
    width 2px
</style>