<script setup>
const allExercises = useAllExercises()

const exercise = ref('')

const newExercise = async () => {
    const credentials = await createExercise(exercise.value)
    exercise.value = ''
}
const active = async (id) => {
    const activeExercise = useActiveExercise()
    activeExercise.value = id
    const activeUser = useActiveUser()
    getWorkouts(activeUser.value, id)
}
</script>

<template lang="pug">
.exercisesList
    .exercisesList__items
        NuxtLink.exercisesList__item(
            v-for="(item, i) in allExercises"
            :key="i"
            @click="active(item.id)"
            :to="`/exercise/${item.name}`"
        ) {{item.name}}
    .exercisesList__actions
        BaseInput(
            v-model="exercise"
            type="text"
            placeholder="Упражение"
        )
        BaseButton.exercisesList__btn(
            @click="newExercise"
            text="Добавить"
        )
</template>
    
<style lang="stylus" scoped>
.exercisesList
    height 100%
    border-right: 1px solid var(--color-border)

    &__items
        height calc(100vh - 126px)
        overflow auto

    &__item
        display block
        cursor pointer
        font-size 18px
        text-align center
        padding 16px 12px
        border-bottom: 1px solid var(--color-border)

    &__actions
        position fixed
        left 0
        bottom 0
        padding 15px
        display grid
        gap 24px
        width 100%
        background var(--color-main-bg)
        border-top: 1px solid var(--color-border)

    &__btn
        width 100%
</style>