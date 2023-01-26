<script setup>
const date = ref('') 
const interval = ref('')
const desc = ref('')
const approach = ref('')

const activeExercise = useActiveExercise()
const allWorkouts = useWorkouts()

const add = async () => {
    const credentials = await createWorkout(activeExercise.value, date.value, interval.value, desc.value, approach.value)
}

const removeActive = async () => {
    activeExercise.value = ''
}
</script>


<template lang="pug">
.detail
    .detail__title
        .detail__name {{ $route.params.name }}
        NuxtLink.detail__back(to="/app" @click="removeActive") Назад
        //- NuxtLink.detail__back(to="/settings" @click="removeActive") Настройки

    .detail__content
        Exercise(
            v-if="allWorkouts"
            v-for="(item, i) in allWorkouts"
            :key="i"
            :date="item.date"
            :interval="item.interval"
            :desc="item.desc"
            :approach="item.approach"
            :res="item.res"
        )
    .detail__actions
        BaseInput(
            v-model="date"
            type="date"
        )
        BaseInput(
            v-model="interval"
            type="text"
            placeholder="Интервал"
        )
        BaseInput(
            v-model="desc"
            type="text"
            placeholder="Заметка"
        )
        BaseInput(
            v-model="approach"
            type="text"
            inputmode="numeric"
            placeholder="Подходы"
        )
        BaseButton.detail__btn(
            @click="add"
            text="Добавить"
        )
</template>

<style lang="stylus" scoped>
.detail
    padding 15px
    height 100%

    &__title
        display flex
        justify-content space-between
        margin-bottom 40px

    &__name
        font-size 24px

    &__content
        display grid
        gap 24px
        margin-bottom 24px
        max-height calc(100vh - 260px)
        overflow auto
        
    &__actions
        position fixed
        left 0
        bottom 0
        display grid
        grid-template-columns: 1fr 1fr
        gap 12px
        width 100%
        padding 15px
        background var(--color-main-bg)
        border-top: 1px solid var(--color-border)

    &__btn
        grid-column: 1/3
        width 100%
</style>
    