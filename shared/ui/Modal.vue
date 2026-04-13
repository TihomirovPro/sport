<script setup lang="ts">
defineProps<{ isShow: boolean }>()
const emit = defineEmits<{ hiden: [] }>()
const slots = useSlots()

const sheetRef = ref<HTMLElement | null>(null)
let startY = 0
let currentDelta = 0
const sheetTranslate = ref(0)
const isDragging = ref(false)

function onTouchStart(e: TouchEvent) {
  if (sheetRef.value && sheetRef.value.scrollTop > 0) return
  startY = e.touches[0].clientY
  currentDelta = 0
  isDragging.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  if (sheetRef.value && sheetRef.value.scrollTop > 0) {
    isDragging.value = false
    sheetTranslate.value = 0
    return
  }
  const delta = e.touches[0].clientY - startY
  if (delta > 0) {
    currentDelta = delta
    sheetTranslate.value = delta
    e.preventDefault()
  }
}

function onTouchEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  if (currentDelta > 80) {
    // Анимируем sheet за экран, затем закрываем — без сброса позиции
    sheetTranslate.value = window.innerHeight
    emit('hiden')
  } else {
    sheetTranslate.value = 0
  }
  currentDelta = 0
}

function onAfterLeave() {
  sheetTranslate.value = 0
}
</script>

<template>
<Transition name="modal-overlay" @after-leave="onAfterLeave">
  <div
    v-show="isShow"
    class="size-full top-0 left-0 fixed flex bg-black/50 dark:bg-black/60 backdrop-blur-md z-[100]"
    @click.self="emit('hiden')"
  >
    <div
      ref="sheetRef"
      role="dialog"
      aria-modal="true"
      class="modal-sheet overflow-auto grid gap-4 pt-3 pb-6 px-3 rounded-t-2xl w-full mt-auto bg-glass backdrop-blur-md max-h-[85%]"
      :style="{
        boxShadow: '0 -4px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5)',
        transform: sheetTranslate > 0 ? `translateY(${sheetTranslate}px)` : undefined,
        transition: isDragging ? 'none' : (sheetTranslate > 0 ? 'transform 0.2s ease-in' : undefined),
      }"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend.passive="onTouchEnd"
    >
      <div class="w-10 h-1 rounded-full bg-text mx-auto mb-1" />

      <slot name="content" />

      <div class="grid grid-flow-col place-items-center gap-5 mt-4" v-if="slots.bottom">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</Transition>
</template>

<style scoped>
.modal-overlay-enter-active {
  transition: opacity 0.25s ease;
}
.modal-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-overlay-enter-active .modal-sheet {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.modal-overlay-leave-active .modal-sheet {
  transition: transform 0.2s ease-in;
}
.modal-overlay-enter-from .modal-sheet,
.modal-overlay-leave-to .modal-sheet {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay-enter-active,
  .modal-overlay-leave-active {
    transition: opacity 0.15s ease !important;
  }
  .modal-overlay-enter-active .modal-sheet,
  .modal-overlay-leave-active .modal-sheet {
    transition: none !important;
  }
  .modal-overlay-enter-from .modal-sheet,
  .modal-overlay-leave-to .modal-sheet {
    transform: none !important;
  }
}
</style>
