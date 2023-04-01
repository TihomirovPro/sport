<script setup>
const activeExercise = useActiveExercise()
const allWorkouts = useWorkouts()

const intervals = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7]
const easeus = ['Свой вес', 'Розовая резина', 'Желтая резина', 'Оранжевая резина', 'Черная резина', 'Филетовая резина', 'Сера-синяя резина', 'Зеленая резина', 'Синяя резина']

const date = ref(new Date()) 
const interval = ref('placeholder')
const ease = ref('placeholder')
const approach = ref('')
const weight = ref('')
const desc = ref('')

let showAddModal = ref(false)

const add = async () => {
    const credentials = await createWorkout(activeExercise.value, date.value, interval.value, ease.value, approach.value, weight.value, desc.value)
    interval.value = 'placeholder'
    ease.value = 'placeholder'
    approach.value = ''
    weight.value = ''
    desc.value = ''
    showAddModal.value = false
}

const removeActive = async () => {
    activeExercise.value = ''
}

const showModal = () => {
    showAddModal.value = !showAddModal.value
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
            :interval="`В ${item.interval} мин`"
            :ease="item.ease"
            :approach="item.approach"
            :weight="item.weight"
            :desc="item.desc"
            :res="item.res"
        )
    button.detail__actions(
        @click="showModal()"
        :class="{ close: showAddModal }"
    )
    .detail__modal(v-if="showAddModal" )
        .detail__modal-wrap
            BaseInput(
                v-model="date"
                type="date"
            )
            BaseSelect(
                v-model="interval"
                placeholder="Выбрать интервал"
                :options="intervals"
            )
            BaseSelect(
                v-model="ease"
                placeholder="Сложность"
                :options="easeus"
            ) 
            BaseInput(
                v-model="approach"
                type="text"
                inputmode="numeric"
                placeholder="Подходы"
            )
            BaseInput(
                v-model="weight"
                type="text"
                inputmode="numeric"
                placeholder="Веса"
            )
            BaseInput(
                v-model="desc"
                type="textarea"
                placeholder="Заметка"
            )
            BaseButton.detail__btn(
                @click="add"
                text="Добавить"
            )
</template>

<style lang="stylus" scoped>
.detail
    height 100%

    &__title
        z-index 10
        position relative
        display flex
        justify-content space-between
        padding 15px
        background #5182dc
        box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)

    &__name
        color rgba(#fff,.8)
        font-size 20px

    &__back
        color rgba(#fff,.8)

    &__content
        display grid
        gap 24px
        max-height 100vh
        padding 15px 15px 120px
        overflow auto

    &__actions
        z-index 101
        position fixed
        width 50px
        height 50px
        display flex
        align-items center
        justify-content center
        font-size 50px
        border-radius 50%
        background #5182dc
        bottom 10px
        right 10px
        box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)
        transition: .3s

        &.close
            transform: rotate(-45deg)

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
        
    &__modal
        z-index 100
        position fixed
        top 0
        left 0
        width 100%
        height 100%
        display flex
        align-items center
        justify-content center
        background rgba(0,0,0,.7)

        &-wrap
            display grid
            grid-template-columns: 1fr 1fr
            gap 12px
            width 90%
            padding 24px 15px
            background #fafafa

        input
        textarea
            grid-column 1/3

    &__btn
        grid-column: 1/3
        width 100%
</style>
    