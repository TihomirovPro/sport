<script setup ts="ts">
useHead({
  title: 'Настройки',
})

const headerTitle = useHeaderTitle()
const colorMode = useColorMode()
const baseColor = ref('rgb(var(--colorAccent))')
const showModalColor = ref(false)
const activeColor = ref('')

if (localStorage.getItem('baseColor')) baseColor.value = `rgb(${localStorage.getItem('baseColor')})`

headerTitle.value = 'Настройки'

function selectColor(color) {
  showModalColor.value = false
  activeColor.value = color

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  baseColor.value = `rgb(${r} ${g} ${b})`
  localStorage.setItem('baseColor', `${r} ${g} ${b}`)

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

  ModalColor(
    :isShow="showModalColor"
    :activeColor="activeColor"
    @hiden="showModalColor = false"
    @selectColor="(color) => selectColor(color)"
  )
</template>
