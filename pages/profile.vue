<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { getFirebaseAuth } from '~/composables/firebaseInit'
import { prepareLogout } from '~/composables/useUser'

definePageMeta({
  title: 'Профиль',
  backTo: '/settings'
})

async function signOutUser() {
  prepareLogout()
  const auth = getFirebaseAuth()
  await signOut(auth)
  await navigateTo('/login')
}
</script>

<template lang="pug">
.content
  .exit(@click="signOutUser") Выход
</template>
