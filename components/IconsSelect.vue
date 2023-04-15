<script setup>
const emits = defineEmits(['select'])
const selectUpdateExercise = useSelectUpdateExercise()
const icons = useIcons()
const activeIcon = ref('')

if (selectUpdateExercise.value) {
  activeIcon.value = selectUpdateExercise.value.icon
}

const selectIcon = (icon) => {
  activeIcon.value = icon
  emits('select', icon)
}
</script>

<template lang="pug">
.icons
  .icons__item(
    v-for="icon in icons"
    :class="[`icon-${icon}`, { active: activeIcon === icon }]"
    @click="selectIcon(icon)"
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