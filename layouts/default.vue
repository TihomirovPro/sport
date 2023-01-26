<script setup>
onMounted(async () => {
  initUser();
});

const active = useActiveExercise()

</script>

<template lang="pug">
.wrapper
    ExercisesList(v-if="!active")
    
    .info(v-if="active")
      slot
        
</template>

<style lang="stylus">
.wrapper
  display grid
  grid-template-columns: 300px 1fr
  height 100%
  @media (max-width: 767px)
    grid-template-columns: 1fr
</style>
