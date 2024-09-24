<script setup>
const route = useRoute()
const router = useRouter()

function link() {
  if (route.name === 'index') router.push('/exercise')
  if (route.name === 'exercise-item') router.push('/workout')
}

function toSettings() {
  router.push('/settings')
}
</script>

<template lang="pug">
.sticky.bottom-0.flex-center.py-2.mt-auto.px-2
  //- NuxtLink(to="/profile")
  //-   svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="30")
  //-     path(d="M175 171c39 0 70-38 70-85 0-48-10-86-70-86s-70 38-70 86c0 47 31 85 70 85zM42 302c0-3 0-1 0 0zm266 2c0-1 0-5 0 0zM308 298c-1-82-12-105-94-120 0 0-12 15-39 15s-39-15-39-15c-81 14-92 38-94 118v15s20 39 133 39 133-39 133-39a3131 3131 0 0 1 0-13z")

  //- NuxtLink(to="/measure")
  //-   svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 545 420" width="30")
  //-     path(d="M187 198c45 0 82-28 82-62s-37-61-82-61-82 27-82 61 37 62 82 62Zm0-101c33 0 60 18 60 39 0 22-28 40-60 40-33 0-60-18-60-40 0-21 27-39 60-39Zm0 0")
  //-     path(d="M534 250H372V136C372 61 289 0 186 0S0 61 0 136v135c0 69 71 126 162 135h2l23 1h347c6 0 11-5 11-11V261c0-6-5-11-11-11ZM187 22c90 0 164 52 164 114 0 63-73 114-164 114S22 199 22 136C22 74 96 22 187 22Zm164 178v50h-63a165 165 0 0 0 62-50Zm172 185h-22v-56a11 11 0 0 0-22 0v56h-44v-30a11 11 0 0 0-21 0v30h-44v-30a11 11 0 0 0-22 0v30h-44v-56a11 11 0 0 0-22 0v56h-42v-30a11 11 0 0 0-22 0v30h-44v-30a11 11 0 0 0-21 0v27C79 371 23 326 23 271v-71c31 43 93 72 164 72h336Zm0 0")

  .size-12.bg-accent.rounded-xl.flex-center.flex-col.gap-1.shadow-md(
    @click="toSettings"
  )
    .w-6.bg-white.rounded(class="h-0.5")
    .w-6.bg-white.rounded(class="h-0.5")
    .w-6.bg-white.rounded(class="h-0.5")

  .ml-auto.flex-center.size-12.bg-accent.rounded-xl.shadow-md(
    @click="link"
  )
    .w-6.bg-white.absolute.rounded(class="h-0.5")
    .h-6.bg-white.absolute.rounded(class="w-0.5")
</template>
