<script setup lang="ts">
defineProps<{ 
  isShow: boolean
}>()

const emit = defineEmits<{
  hiden: []
}>()

</script>

<template lang="pug">
Modal(:isShow="isShow" @hiden="emit('hiden')")
  template(#content)

</template>