<script setup>
const props = defineProps({
  id: String,
  date: String,
  interval: { type: String, default: '' },
  ease: { type: String, default: '' },
  desc: { type: String, default: '' },
  approach: null,
  weight: null,
  res: Number
});

const emits = defineEmits(['update'])

const allWorkouts = useWorkouts()
const selectUpdateWorkout = useSelectUpdateWorkout()

// let resWeight

// if (props.weight) {
//   resWeight = props.weight.split(' ').reduce((sum, current) => {
//     return +sum + +current;
//   })
// }

const removeExercise = async () => {
  const credentials = await removeWorkout(props.id)
}

const updateExercise = () => {
  selectUpdateWorkout.value = allWorkouts.value.find(item => item.id === props.id)
  emits('update')
}

const fixDate = () => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return new Date(props.date).toLocaleString("ru", options).slice(0, -2)
}
</script>

<template lang="pug">
.exercise
  .exercise__top
    p {{ fixDate() }}
    p {{ interval }}
    p(v-if="ease") {{ ease }}

  .exercise__approach
    span(
      v-for="item in approach"
    ) {{ item }}
    span.exercise__all {{ res }}

  .exercise__weight(v-if="weight")
    span(
      v-for="item in weight"
    ) {{ item }}
    //- span.exercise__all {{ resWeight }}
    span.exercise__all 

  .exercise__desc(v-if="desc") {{ desc }}

  .exercise__bottom
    div(@click="updateExercise()")
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 511" width="20" height="20"><path fill="#5182dc" d="M405 256c-11 0-21 10-21 22v170c0 12-10 22-21 22H64c-12 0-21-10-21-22V150c0-12 9-22 21-22h171a21 21 0 1 0 0-42H64c-35 0-64 29-64 64v298c0 36 29 64 64 64h299c35 0 64-28 64-64V278c0-12-10-22-22-22zm0 0"/><path fill="#5182dc" d="M200 237a11 11 0 0 0-3 5l-15 76c-1 3 0 7 3 10a11 11 0 0 0 7 3l3-1 75-15c2 0 4-1 5-3l169-168-75-76zM496 16a53 53 0 0 0-75 0l-30 30 76 75 29-29a53 53 0 0 0 0-76zm0 0"/></svg>
    span(@click="removeExercise()")
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20"><path fill="red" d="M19 24v-9a1 1 0 1 1 2 0v9a1 1 0 1 1-2 0zm-3 1a1 1 0 0 0 1-1v-9a1 1 0 1 0-2 0v9a1 1 0 0 0 1 1zm-4 0a1 1 0 0 0 1-1v-9a1 1 0 1 0-2 0v9a1 1 0 0 0 1 1zM29 7v2a2 2 0 0 1-2 2h-1L25 27.2a3 3 0 0 1-3 2.8H9.9a3 3 0 0 1-3-2.8L6.1 11H5a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2h6V4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1h6a2 2 0 0 1 2 2zM13 5h6V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm11 6H8L9 27a1 1 0 0 0 1 1h12.2a1 1 0 0 0 1-1l.8-16zm3-2V7H5v2z"/></svg>
</template>

<style lang="stylus" scoped>
.exercise
  display grid
  gap 12px
  max-width: 600px
  width 100%
  margin 0 auto
  padding 16px 12px
  border-radius 12px
  background #fafafa
  border 1px solid rgba(#dcdcdc,.5)
  box-shadow 0 0 5px rgba(#5182dc, .2)

  &__top
    display grid
    grid-template-columns repeat(auto-fit, minmax(0, 1fr))
    text-align center
    align-items center
    color darken(rgba(#5182dc, 1), 30%)

  &__approach
  &__weight
    display grid
    grid-template-columns repeat(auto-fit, minmax(0, 1fr))
    padding 12px 0 0
    text-align center
    border-top 1px solid rgba(#dcdcdc,.6)
    
    span:not(:first-child)
      border-left 1px solid rgba(#dcdcdc,.6)

  &__desc
    padding 12px
    color rgba(#262626, .8)
    border-top 1px solid rgba(#dcdcdc,.6)

  &__bottom
    display flex
    justify-content space-between
    padding 12px 0 0
    border-top 1px solid rgba(#dcdcdc,.6)

  &__all
    font-size 16px
    font-weight 700
    color red
    text-align right
</style>