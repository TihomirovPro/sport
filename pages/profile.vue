<script setup type="ts">
definePageMeta({
  title: 'Профиль',
})
</script>

<template lang="pug">
.content
  .exit(@click="signOutUser") Выход
</template>
