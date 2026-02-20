<template lang="pug">
.preloader.absolute.flex-center.inset-0.size-full.z-10(class="bg-black/70")
  <svg xmlns="http://www.w3.org/2000/svg" width="100" viewBox="0 0 200 200"><circle stroke-width="10" r="15" cx="40" cy="100"><animate attributeName="opacity" calcMode="spline" dur="1" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle stroke-width="10" r="15" cx="100" cy="100"><animate attributeName="opacity" calcMode="spline" dur="1" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle stroke-width="10" r="15" cx="160" cy="100"><animate attributeName="opacity" calcMode="spline" dur="1" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
</template>

<style lang="stylus">
.preloader circle
  fill unquote('rgb(var(--colorAccent))')
</style>
