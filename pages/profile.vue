<script setup>
useHead({
  title: 'Профиль',
})
</script>

<template lang="pug">
.content
  .exit(@click="signOutUser") Выход
</template>
