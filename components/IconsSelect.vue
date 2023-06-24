<script setup lang="ts">
const emits = defineEmits(['select'])
const updateExercise = useSelectUpdateExercise()
const icons = useIcons()

const icon = ref({
  active: '',
  select: (name:string) => icon.value.active = name
})


watchEffect(() => {
  if (updateExercise.value) {
    icon.value.active = updateExercise.value.icon
  } else {
    icon.value.active = ''
  }
})

function selectIcon(iconName:string) {
  icon.value.active = iconName
  emits('select', iconName)
}
</script>

<template lang="pug">
.icons
  .icons__item(
    v-for="iconName in icons"
    :class="[`icon-${iconName}`, { active: icon.active === iconName }]"
    @click="selectIcon(iconName)"
  )
</template>

<style lang="stylus" scoped>
.icons
  display grid
  place-items center
  grid-template-columns 1fr 1fr 1fr 1fr
  font-size 38px

  &__item
    border-radius 4px
    translate 250ms
    border 1px solid transparent
    background transparent
    &.active
      border 1px solid #5182dc
      background rgb(#5182dc / .6)
</style>