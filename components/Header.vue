<script setup>
const props = defineProps({
  title: String,
  backBtn: Boolean
});

const allWorkouts = useWorkouts()
const easeus = useEaseus()
const isActiveFilters = useActiveFilters()
const isShowMenu = useShowMenu()
const activeExercise = useActiveExercise()
const interval = ref('1') 

const easeusFilter = ['Все', 'Только в резине', ...easeus.value]
const ease = ref(easeusFilter[0])

const removeActive = async () => {
  activeExercise.value = ''
  isActiveFilters.value = false
}

const changeFilterStatus = () => {
  isActiveFilters.value = !isActiveFilters.value
  if (isActiveFilters.value) {
    filter()
  }
}

const filter = () => {
  if (ease.value === easeusFilter[0]) {
    allWorkouts.value.forEach(element => {
      if (element.interval === interval.value) {
        element.filter = true
      } else {
        element.filter = false
      }
    })
  }
  else if (ease.value === easeusFilter[1]) {
    allWorkouts.value.forEach(element => {
      if (element.interval === interval.value && element.ease !== 'Свой вес' && element.ease !== 'С весом') {
        element.filter = true
      } else {
        element.filter = false
      }
    })
  }
  else {
    allWorkouts.value.forEach(element => {
      if (element.interval === interval.value && element.ease === ease.value) {
        element.filter = true
      } else {
        element.filter = false
      }
    })
  }
}

</script>

<template lang="pug">
header.header
  .header__wrap
    <svg @click="isShowMenu = true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 464 464" width="24px" height="24"><path fill="#fff" d="M435 406H29a29 29 0 1 1 0-58h406a29 29 0 0 1 0 58zm0-145H29a29 29 0 1 1 0-58h406a29 29 0 1 1 0 58zm0-145H29a29 29 0 1 1 0-58h406a29 29 0 1 1 0 58z"/></svg>
    .header__title {{ title }}
  <svg v-if="backBtn" @click="changeFilterStatus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#fff" fill-rule="evenodd" d="M18 12a4 4 0 1 0-3.87-5H3a1 1 0 0 0 0 2h11.13A4 4 0 0 0 18 12zm-2-4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM2 16a4 4 0 0 1 7.87-1H21a1 1 0 1 1 0 2H9.87A4 4 0 0 1 2 16zm6 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0z" clip-rule="evenodd"/></svg>
  NuxtLink.header__back(
    v-if="backBtn"
    to="/"
    @click="removeActive"
    ) Назад
  Menu(v-if="isShowMenu")
  .filters(v-if="backBtn && isActiveFilters")
    BaseInputRange(v-model="interval" @input="filter")
    BaseSelect(
      v-model="ease"
      placeholder="Сложность"
      :options="easeusFilter"
      @change="filter"
    )
</template>

<style lang="stylus">
.header
  z-index 10
  position relative
  width 100%
  display flex
  flex-wrap wrap
  align-items center
  justify-content space-between
  padding 15px
  background #5182dc
  box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)

  &__title
    color rgba(#fff,.8)
    font-size 20px

  &__back
    color rgba(#fff,.8)

  &__wrap
    display flex
    align-items center
    gap 10px

.filters
  display grid
  gap 12px
  position relative
  width calc(100% + 30px)
  margin 12px -15px -15px
  background #fafafa
  padding 12px 16px
  box-shadow 0 0 10px rgba(darken(#fafafa, 30%), .6)
</style>