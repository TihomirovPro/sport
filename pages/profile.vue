<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { getFirebaseAuth } from '~/composables/firebaseInit'

definePageMeta({
  title: 'Профиль',
})

async function signOutUser() {
  const auth = getFirebaseAuth()
  await signOut(auth)
  await navigateTo('/login')
}
</script>

<template lang="pug">
.content
  .exit(@click="signOutUser") Выход
</template>
