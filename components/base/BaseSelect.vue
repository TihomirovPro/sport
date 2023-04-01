<script setup>
const props = defineProps({
    options: null,
    placeholder: String,
    modelValue: String
});
</script>

<template lang="pug">
select.input(
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
)
    option(
        selected
        disabled
        value="placeholder"
    ) {{ placeholder }}
    option(
        v-for="(option,i) in options"
        :key="i"
        :value="option"
    ) {{ option }}
</template>

<style lang="stylus">
// .input
//     padding 8px
//     border 1px solid rgba(#dcdcdc,.5)
//     border-radius 4px
//     width 100%
</style>