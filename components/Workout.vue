<script setup lang="ts">
import type { TypeWorkoutPage } from '~/composables/types'

const props = defineProps<TypeWorkoutPage>()

const router = useRouter()
const allWorkouts = useWorkouts()
const selectUpdateWorkout = useSelectUpdateWorkout()

const formatDate = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date(props.date)).slice(0, -3)

const resWeight = computed(() => {
  if (props.weight) {
    return props.weight.reduce((acc, item) => acc + +item, 0)
  }

  return 0
})

function selectUpdate() {
  selectUpdateWorkout.value = allWorkouts.value.find(item => item.id === props.id)
  router.push('/workout')
}
</script>

<template lang="pug">
.grid.w-full.py-4.px-3.text-xs.border.border-faint.rounded-xl.shadow-md(class="bg-faint/20")
  .flex.items-center.justify-between.text-accent.pb-6
    p {{ formatDate }}
    p {{ approach.length }} x {{ interval }}
    p {{ ease === EnumEase.rubber ? rubber : ease }}

  .grid.text-center.items-center.pb-1(class="grid-cols-[repeat(auto-fit,minmax(0,1fr))]")
    .text-left(class="text-[rgb(var(--colorIcon))]/40") пвт
    .border-l.border-faint(
      v-for="item in approach"
    ) {{ item }}
    .text-error.text-right.text-sm.border-l.border-faint {{ res }}

  .grid.text-center.items-center.border-t.border-faint.py-1(
    class="grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
    v-if="weight"
  )
    .text-left(class="text-[rgb(var(--colorIcon))]/40") кг
    .border-l.border-faint(
      v-for="item in weight"
    ) {{ item }}
    .text-error.text-right.text-sm.border-l.border-faint {{ resWeight }}

  .border-t.border-faint.p-2.mt-2(v-if="desc") {{ desc }}

  .flex.justify-end.pt-3
    div(@click="selectUpdate")
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 511" width="20" height="20"><path fill="rgb(var(--colorAccent))" d="M405 256c-11 0-21 10-21 22v170c0 12-10 22-21 22H64c-12 0-21-10-21-22V150c0-12 9-22 21-22h171a21 21 0 1 0 0-42H64c-35 0-64 29-64 64v298c0 36 29 64 64 64h299c35 0 64-28 64-64V278c0-12-10-22-22-22zm0 0"/><path fill="rgb(var(--colorAccent))" d="M200 237a11 11 0 0 0-3 5l-15 76c-1 3 0 7 3 10a11 11 0 0 0 7 3l3-1 75-15c2 0 4-1 5-3l169-168-75-76zM496 16a53 53 0 0 0-75 0l-30 30 76 75 29-29a53 53 0 0 0 0-76zm0 0"/></svg>
</template>
