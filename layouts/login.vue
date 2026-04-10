<template>
<div class="flex-center h-full">
  <div class="h-full overflow-auto">
    <slot />
  </div>
  <UiGlobalNotifications />
</div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
