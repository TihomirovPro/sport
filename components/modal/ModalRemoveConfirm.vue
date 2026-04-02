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
  <Modal :isShow="isShow" @hiden="emit('hiden')">
    <template #content>
      <div class="modal__text">{{ text }}</div>
    </template>

    <template #bottom>
      <BaseButton
        text="Отменить"
        @click="emit('cancelRemove')"
      />
      <BaseButton
        red
        text="Удалить"
        @click="emit('remove')"
      />
    </template>
  </Modal>
</template>