<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { IDB_KEYS } from '~/shared/config/storageKeys'
import { idbStorage } from '~/shared/api/storage/idb'

const userStore = useUserStore()
const { activeUser } = storeToRefs(userStore)

const savedColor = idbStorage.getItem(IDB_KEYS.BASE_COLOR)

if (savedColor) {
  const html = document.querySelector('html')
  html?.style.setProperty('--color-accent', `${savedColor}`)
}

</script>

<template>
<div v-if="activeUser.uid" class="grid min-h-full grid-rows-[auto_1fr]">
  <Header />
  <main class="px-2 py-3 max-w-2xl size-full mx-auto relative">
    <slot />
  </main>
  <UiGlobalNotifications />
</div>
</template>

<style>
.page-enter-active {
  transition: opacity 280ms ease-out, transform 280ms ease-out;
  will-change: transform, opacity;
}
.page-leave-active {
  transition: opacity 200ms ease-in, transform 200ms ease-in;
  will-change: transform, opacity;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 150ms;
  }
  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>
