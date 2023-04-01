<script setup>
const props = defineProps({
    type: String,
    placeholder: String,
    modelValue: String
});
</script>

<template lang="pug">
textarea.input(
    v-if="type === 'textarea'"
    :value="modelValue"
    :placeholder="placeholder"
    autocomplete="off"
    @input="$emit('update:modelValue', $event.target.value)"
)
input.input(
    v-else
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    autocomplete="off"
    @input="$emit('update:modelValue', $event.target.value)"
)
</template>

<style lang="stylus">
.input
    padding 10px 8px
    font-size 14px
    border 1px solid rgba(#dcdcdc,1)
    border-radius 4px
    width 100%
    max-width 100%
    min-height 42px
</style>