<script setup>
const props = defineProps({
    date: String,
    interval: { type: String, default: '' },
    desc: { type: String, default: '' },
    approach: String,
    res: Number
});

</script>
<template lang="pug">
.exercise
    .exercise__top
        p {{ date }}
        p {{ interval }}
        p {{ desc }}
    .exercise__bottom
        p(
            v-for="(item, i) in approach.split(' ')"
            :key="i"
        ) {{ item }}
        p.exercise__all {{ res }}
</template>

<style lang="stylus" scoped>
.exercise
    display grid
    gap 12px
    max-width: 600px
    padding 16px
    border-radius 12px
    background #fff

    &__top
        display grid
        grid-template-columns: 1fr 1fr 1fr
        text-align center

    &__bottom
        display grid
        grid-auto-flow column
        padding 12px 0 0
        text-align center
        border-top 1px solid var(--color-border)

    &__all
        font-size 18px
        font-weight 700
        color red
</style>