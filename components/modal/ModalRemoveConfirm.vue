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

<template>
  <UiModal :isShow="isShow" @hiden="emit('hiden')">
    <template #content>
      <div class="modal__text">{{ text }}</div>
    </template>

    <template #bottom>
      <UiButton
        text="Отменить"
        @click="emit('cancelRemove')"
      />
      <UiButton
        red
        text="Удалить"
        @click="emit('remove')"
      />
    </template>
  </UiModal>
</template>