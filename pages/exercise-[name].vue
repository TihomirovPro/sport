<script setup>
const activeExercise = useActiveExercise()
const allWorkouts = useWorkouts()

const easeus = ['Свой вес', 'Розовая резина', 'Желтая резина', 'Оранжевая резина', 'Черная резина', 'Филетовая резина', 'Сера-синяя резина', 'Зеленая резина', 'Синяя резина']
const nowDate = new Date();

const date = ref(`${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`) 
const interval = ref('2.5')
const ease = ref(easeus[0])
const approach = ref('')
const weight = ref('')
const desc = ref('')
const error = ref(false)
const showAddModal = ref(false)

const fixDate = () => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    
    return new Date(date.value).toLocaleString("ru", options).slice(0, -2)
}

const add = async () => {
    if (approach.value) {
        const credentials = await createWorkout(activeExercise.value, date.value, interval.value, ease.value, approach.value, weight.value, desc.value)
        interval.value = '2.5'
        ease.value = easeus[0]
        approach.value = ''
        weight.value = ''
        desc.value = ''
        showAddModal.value = false
        error.value = false
    } else {
        error.value = true
    }
}

const showModal = () => {
    showAddModal.value = !showAddModal.value
}
</script>

<template lang="pug">
.detail
    Header(:title="$route.params.name" :backBtn="true")

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
            label.date-label
                span {{ fixDate() }}
                BaseInput(
                    v-model="date"
                    type="date"
                )
            BaseInputRange(v-model="interval")
            BaseSelect(
                v-model="ease"
                placeholder="Сложность"
                :options="easeus"
            )
            BaseInput(
                v-model="approach"
                type="text"
                :error="error"
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
            gap 16px
            width 90%
            padding 24px 15px
            background #fafafa

    &__btn
        width 100%

.date-label
    padding: 12px
    text-align center
    font-size 18px
    input
        position absolute
        visibility hidden
        z-index -1
</style>
    