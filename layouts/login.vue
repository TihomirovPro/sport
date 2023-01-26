<script setup>
onMounted(async () => {
  initUser();
});

</script>

<template lang="pug">
.wrapper
  slot   
</template>

<style lang="stylus" scoped>
.wrapper
  height 100%
</style>

