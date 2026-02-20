<script setup lang="ts">
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const shown = ref(false)
const installEvent = ref<BeforeInstallPromptEvent | null>(null)

function onBeforeInstallPrompt(event: Event) {
  event.preventDefault()
  installEvent.value = event as BeforeInstallPromptEvent
  shown.value = true
}

function dismissPrompt() {
  shown.value = false
}

async function installPWA() {
  if (!installEvent.value) return

  await installEvent.value.prompt()
  await installEvent.value.userChoice
  dismissPrompt()
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
})
</script>

<template>
  <div
    v-if="shown"
    class="
      z-[500] fixed
      left-1/2 bottom-6 -translate-x-1/2
      flex w-[90%] p-4 items-center
      text-sm border border-faint
      rounded-xl shadow-md bg-faint
    "
  >
    <p>Установить приложение?</p>

    <button
      class="
        ml-auto transition mr-6 bg-accent
        hover:bg-accent/80 text-sm  py-2.5 px-4 rounded
        text-white text-center cursor-pointer
      "
      @click="installPWA"
    >
      Установить
    </button>
    <button
      @click="dismissPrompt"
      class="
        transition bg-accent
        hover:bg-accent/80 text-sm py-2.5 px-4 rounded
        text-white text-center cursor-pointer
      "
    >
      Нет
    </button>
  </div>
</template>
