<script setup>
const props = defineProps({
    type: String,
    placeholder: String,
    modelValue: String
});
</script>

<template lang="pug">
input.input(
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', $event.target.value)"
)
</template>

<style lang="stylus" scoped>
.input
    padding 8px
    border 1px solid var(--color-border)
    border-radius 4px
    width 100%
</style>