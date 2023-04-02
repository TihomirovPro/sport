<script setup>
const props = defineProps({
    date: String,
    interval: { type: String, default: '' },
    ease: { type: String, default: '' },
    desc: { type: String, default: '' },
    approach: String,
    weight: String,
    res: Number
});

let resWeight

if (props.weight) {
    resWeight = props.weight.split(' ').reduce((sum, current) => {
        return +sum + +current;
    })
}

const fixDate = () => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    
    return new Date(props.date).toLocaleString("ru", options).slice(0, -2)
}
</script>

<template lang="pug">
.exercise
    .exercise__top
        p {{ fixDate() }}
        p {{ interval }}
        p(v-if="ease") {{ ease }}

    .exercise__approach
        span(
            v-for="(item, i) in approach.split(' ')"
            :key="i"
        ) {{ item }}
        span.exercise__all {{ res }}

    .exercise__weight(v-if="weight")
        span(
            v-for="(item, i) in weight.split(' ')"
            :key="i"
        ) {{ item }}
        span.exercise__all {{ resWeight }}
       
    .exercise__desc(v-if="desc") {{ desc }}
    
</template>

<style lang="stylus" scoped>
.exercise
    display grid
    gap 12px
    max-width: 600px
    padding 16px 12px
    border-radius 12px
    background #fafafa
    border 1px solid rgba(#dcdcdc,.5)
    box-shadow 0 0 5px rgba(#5182dc, .2)

    &__top
        display grid
        grid-template-columns repeat(auto-fit, minmax(0, 1fr))
        text-align center
        align-items center
        color darken(rgba(#5182dc, 1), 30%)

    &__approach
    &__weight
        display grid
        grid-template-columns repeat(auto-fit, minmax(0, 1fr))
        padding 12px 0 0
        text-align center
        border-top 1px solid rgba(#dcdcdc,.6)

    &__desc
        padding 12px
        color rgba(#262626, .8)
        border-top 1px solid rgba(#dcdcdc,.6)


    &__all
        font-size 16px
        font-weight 700
        color red
        text-align right
</style>