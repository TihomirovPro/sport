<script setup lang="ts">
defineProps<{
  isShow: boolean
  text: string
}>()

const emit = defineEmits<{
  hiden: []
  remove: []
  cancelRemove: []
}>()

</script>

<template lang="pug">
Modal(:isShow="isShow" @hiden="emit('hiden')")
  template(#content)
    .modal__text {{ text }}

  template(#bottom)
    BaseButton(
      text="Отменить"
      @click="emit('cancelRemove')"
    )
    BaseButton(
      red
      text="Удалить"
      @click="emit('remove')"
    )
</template>