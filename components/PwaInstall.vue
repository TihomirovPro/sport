<script>
export default {
  data: () => ({
    shown: false,
    installEvent: null
  }),

  beforeMount() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.installEvent = e
      this.shown = true
    })
  },

  methods: {
    dismissPrompt() {
      this.shown = false
    },

    installPWA() {
      this.installEvent.prompt()
      this.installEvent.userChoice.then((choice) => {
        this.dismissPrompt() // Hide the prompt once the user's clicked
        if (choice.outcome === 'accepted') {
          // Do something additional if the user chose to install
        } else {
          // Do something additional if the user declined
        }
      })
    },
  }
}
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
        hover_bg-accent/80 text-sm  py-2.5 px-4 rounded
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
        hover_bg-accent/80 text-sm py-2.5 px-4 rounded
        text-white text-center cursor-pointer
      "
    >
      Нет
    </button>
  </div>
</template>