<script setup ts="ts">
useHead({
  title: 'Настройки',
})

const headerTitle = useHeaderTitle()
const colorMode = useColorMode()
const baseColor = ref('rgb(var(--colorAccent))')
const showModalColor = ref(false)
const showModalRubbers = ref(false)

if (localStorage.getItem('baseColor')) baseColor.value = localStorage.getItem('baseColor')

headerTitle.value = 'Настройки'

function selectColor(color) {
  showModalColor.value = false

  baseColor.value = color
  localStorage.setItem('baseColor', color)

  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  const html = document.querySelector('html')
  html.style.setProperty('--colorAccent', `${r} ${g} ${b}`)
}

function changeTheme() {
  if (colorMode.preference === 'dark') colorMode.preference = 'light'
  else colorMode.preference = 'dark'
}
</script>

<template lang="pug">
.grid.gap-3
  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="changeTheme")
    p Тема
    p {{ colorMode.preference }}


  .flex.items-center.justify-between.border-b.border-faint.py-2(@click="showModalColor = true")
    p основной цвет
    .size-9.rounded(:style="`background: ${baseColor}`")

  //- .flex.items-center.justify-between.border-b.border-faint.py-2(@click="showModalRubbers = true")
  //-   p Набор резин

  ModalColor(
    :isShow="showModalColor"
    :activeColor="baseColor"
    @hiden="showModalColor = false"
    @selectColor="(color) => selectColor(color)"
  )
  //- ModalRubbers(
  //-   :isShow="showModalRubbers"
  //-   @hiden="showModalRubbers = false"
  //- )
</template>
