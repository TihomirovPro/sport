<template lang="pug">
.exercise
    .exercise__top
        p 6.12.2022
        p в 2 мин
        p зеленая
    .exercise__bottom
        p 8
        p 8
        p 6
        p 5
        p 4
</template>

<style lang="stylus" scoped>
.exercise
    display grid
    gap 12px
    max-width: 600px
    margin-bottom 24px

    &__top
        display grid
        grid-template-columns: 1fr 1fr 1fr

    &__bottom
        display grid
        grid-auto-flow column
</style>