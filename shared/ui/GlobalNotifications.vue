<script setup lang="ts">
const { notifications, removeNotification } = useNotifications()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto w-full max-w-xl px-3">
    <TransitionGroup name="notification" tag="div" class="space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="pointer-events-auto rounded-md border border-error/70 bg-black/85 px-4 py-3 text-sm text-white shadow-lg"
      >
        <div class="flex items-start justify-between gap-3">
          <p>{{ notification.message }}</p>
          <button
            class="text-white/80 transition hover:text-white"
            type="button"
            aria-label="Закрыть уведомление"
            @click="removeNotification(notification.id)"
          >
            ×
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.2s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
