<template>
<div class="flex-center h-full">
  <div class="h-full overflow-auto">
    <slot />
  </div>
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
