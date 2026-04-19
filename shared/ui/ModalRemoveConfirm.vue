<script setup lang="ts">
const { t } = useI18n()

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
        :text="t('confirm.cancel')"
        @click="emit('cancelRemove')"
      />
      <UiButton
        red
        :text="t('confirm.delete')"
        @click="emit('remove')"
      />
    </template>
  </UiModal>
</template>
