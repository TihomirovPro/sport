<script setup>
const allExercises = useAllExercises()

const exercise = ref('')
const error = ref(false)

const newExercise = async () => {
    if (exercise.value) {
        const credentials = await createExercise(exercise.value)
        exercise.value = ''
        error.value = false
    } else {
        error.value = true
    }
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
    Header(title="Упражнения")
    .exercisesList__items
        NuxtLink.exercisesList__item(
            v-for="(item, i) in allExercises"
            :key="i"
            @click="active(item.id)"
            :to="`/exercise-${item.name}`"
        ) {{item.name}}
    .exercisesList__actions
        BaseInput(
            v-model="exercise"
            type="text"
            :error="error"
            placeholder="Добавить упражение"
        )
        button.exercisesList__btn(
            @click="newExercise"
        )
</template>
    
<style lang="stylus" scoped>
.exercisesList
    height 100%

    &__items
        height calc(100vh - 75px - 50px)
        overflow auto

    &__item
        display block
        cursor pointer
        font-size 20px
        text-align center
        padding 18px 12px
        border-bottom: 1px solid rgba(#dcdcdc,.5)
        color #5182dc

    &__actions
        position fixed
        left 0
        bottom 0
        padding 15px
        display grid
        grid-template-columns 1fr 42px
        gap 10px
        width 100%
        background #fafafa
        border-top: 1px solid rgba(#dcdcdc,1)

    &__btn
        position relative
        width 100%
        background #5182dc
        display flex
        align-items center
        justify-content center
        border-radius 8px

        &:before
        &:after
            position absolute
            content: ''
            display block
            background #fafafa

        &:before
            width 20px
            height 2px
        &:after
            height 20px
            width 2px
</style>