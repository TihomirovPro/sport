<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const pagesWithoutBackBtn = ['index']
const isShowBackBtn = computed(() => !pagesWithoutBackBtn.includes(route.name))
const headerTitle = useHeaderTitle()
const selectUpdateExercise = useSelectUpdateExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const activeExercise = useActiveExercise()

function back() {
  if (route.name === 'workout') {
    selectUpdateWorkout.value = null
    localStorage.removeItem('newWorkout')
    localStorage.removeItem('approaches')
    router.push('/exercise-item')
    return
  }

  if (activeExercise.value && route.name === 'settings') {
    router.push('/exercise-item')
    return
  }

  if (activeExercise.value && route.name === 'exercise-item') {
    activeExercise.value = null
    localStorage.removeItem('activeExercise')
  }

  if (selectUpdateExercise.value) selectUpdateExercise.value = null

  router.push('/')
}

function addItem() {
  if (route.name === 'index') router.push('/exercise')
  if (route.name === 'exercise-item') router.push('/workout')
  if (route.name === 'exercise-item' && activeExercise.value?.isComplex) router.push('/complex')
}

function toSettings() {
  router.push('/settings')
}
</script>

<template lang="pug">
.px-2.py-1.sticky.top-0.bg-accent.shadow-md(class="z-50")
  .max-w-2xl.mx-auto.flex.flex-wrap.items-center.justify-between
    .size-8.text-l.flex-center(class="text-white/80")(
      v-if="isShowBackBtn"
      @click="back"
    )
      .gg-push-chevron-left
    .size-8.flex-center.flex-col.gap-1(
      v-else
      @click="toSettings"
    )
      <svg  class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="#fff" fill-rule="evenodd" d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM9.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Z" clip-rule="evenodd"/><path fill="#fff" fill-rule="evenodd" d="M11.97 1.25c-.44 0-.81 0-1.12.02-.31.02-.61.07-.9.19-.68.28-1.21.81-1.5 1.49-.14.35-.18.72-.19 1.12a.87.87 0 0 1-.42.73.87.87 0 0 1-.84 0c-.35-.2-.7-.34-1.07-.4-.72-.09-1.45.1-2.03.55-.25.2-.44.43-.62.7-.17.25-.35.57-.58.95l-.02.05c-.22.38-.41.7-.54.98-.14.28-.25.57-.3.88-.09.72.1 1.45.55 2.03.23.3.53.52.87.73.28.18.43.45.43.73 0 .28-.15.55-.43.73-.34.21-.64.43-.87.73a2.75 2.75 0 0 0-.54 2.03c.04.31.15.6.29.88.13.28.32.6.54.98l.02.05c.23.38.41.7.58.96.18.26.37.5.62.69.58.44 1.3.64 2.03.54.38-.05.72-.2 1.07-.39.29-.15.6-.14.84 0s.4.4.42.73c.01.4.05.77.2 1.12.28.68.81 1.21 1.49 1.5.29.11.59.16.9.18.3.02.68.02 1.12.02h.06c.44 0 .81 0 1.12-.02.31-.02.61-.07.9-.19.68-.28 1.21-.81 1.5-1.49.14-.35.18-.72.19-1.12.01-.32.18-.6.42-.73a.87.87 0 0 1 .84 0c.35.2.7.34 1.07.4.72.09 1.45-.1 2.03-.55.25-.2.44-.43.62-.7.17-.25.35-.57.58-.95l.02-.05c.22-.38.41-.7.54-.98.14-.28.25-.57.3-.88.09-.72-.1-1.45-.55-2.03-.23-.3-.53-.52-.87-.73a.87.87 0 0 1-.43-.73c0-.28.15-.55.43-.73.34-.21.64-.43.87-.73.44-.58.64-1.31.54-2.03-.04-.31-.15-.6-.29-.88-.13-.28-.32-.6-.54-.98l-.02-.05c-.23-.38-.41-.7-.58-.96-.18-.26-.37-.5-.62-.69a2.75 2.75 0 0 0-2.03-.54c-.38.05-.72.2-1.07.39a.87.87 0 0 1-.84 0 .87.87 0 0 1-.42-.73c-.01-.4-.05-.77-.2-1.12a2.75 2.75 0 0 0-1.49-1.5 2.82 2.82 0 0 0-.9-.18c-.3-.02-.68-.02-1.12-.02h-.06Zm-1.45 1.6c.08-.04.2-.07.44-.08.24-.02.56-.02 1.04-.02s.8 0 1.04.02c.24.01.36.04.44.08.3.12.55.37.67.67.04.1.08.25.1.6.02.8.43 1.56 1.16 1.98.72.42 1.59.4 2.29.02.31-.17.46-.21.57-.23.32-.04.66.05.92.25.07.05.15.14.28.34.14.2.3.48.54.9.24.4.4.68.5.9.11.22.15.34.16.42.04.33-.05.66-.25.93-.06.08-.18.18-.48.37a2.37 2.37 0 0 0-1.13 2c0 .84.46 1.57 1.13 2 .3.19.42.29.48.37.2.27.3.6.25.93-.01.08-.05.2-.15.41-.11.23-.27.5-.5.91-.25.42-.4.7-.55.9-.13.2-.21.29-.28.34-.26.2-.6.29-.93.25-.1-.02-.25-.06-.56-.23-.7-.37-1.57-.4-2.3.02a2.37 2.37 0 0 0-1.16 1.97c-.01.36-.05.51-.09.6-.12.31-.37.56-.67.68-.08.04-.2.07-.44.08-.24.02-.56.02-1.04.02s-.8 0-1.04-.02a1.38 1.38 0 0 1-.44-.08c-.3-.12-.55-.37-.67-.67-.04-.1-.08-.25-.1-.6A2.37 2.37 0 0 0 8.6 17.9c-.72-.42-1.59-.4-2.29-.02-.31.17-.46.21-.57.23-.32.04-.66-.05-.92-.25a1.38 1.38 0 0 1-.28-.34c-.14-.2-.3-.48-.54-.9-.24-.4-.4-.68-.5-.9-.11-.22-.15-.34-.16-.42-.04-.33.05-.66.25-.93.06-.08.18-.18.48-.37a2.37 2.37 0 0 0 1.13-2c0-.84-.46-1.57-1.13-2-.3-.19-.42-.29-.48-.37-.2-.27-.3-.6-.25-.93.01-.08.05-.2.15-.41.11-.23.27-.5.5-.92.25-.4.4-.68.55-.89.13-.2.21-.29.28-.34.26-.2.6-.29.93-.25.1.02.25.06.56.23.7.37 1.57.4 2.3-.02a2.37 2.37 0 0 0 1.16-1.97c.01-.36.05-.51.09-.6.12-.31.37-.56.67-.68Z" clip-rule="evenodd"/></svg>

    .text-l(class="text-white/80") {{ headerTitle }}

    .flex-center.size-8(
      @click="addItem"
    )
      .w-4.bg-white.absolute.rounded(class="h-0.5")
      .h-4.bg-white.absolute.rounded(class="w-0.5")
</template>

<style>
  .gg-push-chevron-left {
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    border: 2px solid transparent;
    border-radius: 100px;
  }

  .gg-push-chevron-left::after {
    content: "";
    display: block;
    box-sizing: border-box;
    position: absolute;
    width: 10px;
    height: 10px;
    border-left: 2px solid;
    border-bottom: 2px solid;
    transform: rotate(45deg);
    left: 6px;
    top: 4px;
  }
</style>