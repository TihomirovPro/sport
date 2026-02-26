<script setup lang="ts">
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const shown = ref(false)
const isInstalling = ref(false)
const installEvent = ref<BeforeInstallPromptEvent | null>(null)

function onBeforeInstallPrompt(event: Event) {
  event.preventDefault()
  installEvent.value = event as BeforeInstallPromptEvent
  shown.value = true
}

function onAppInstalled() {
  installEvent.value = null
  shown.value = false
}

function dismissPrompt() {
  shown.value = false
}

async function installPWA() {
  if (!installEvent.value || isInstalling.value) return

  isInstalling.value = true

  try {
    await installEvent.value.prompt()
    const { outcome } = await installEvent.value.userChoice

    if (outcome === 'accepted') {
      shown.value = false
    }
  } catch (error) {
    console.error('PWA install prompt failed:', error)
  } finally {
    installEvent.value = null
    isInstalling.value = false
    dismissPrompt()
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
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
      :disabled="isInstalling"
      @click="installPWA"
    >
      {{ isInstalling ? 'Устанавливаем...' : 'Установить' }}
    </button>
    <button
      :disabled="isInstalling"
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
