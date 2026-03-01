<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { TypeWorkoutPage } from '~/composables/types'

const props = defineProps<TypeWorkoutPage & { isComplex?: boolean }>()

const router = useRouter()
const workoutStore = useWorkoutStore()
const { workouts, selectUpdateWorkout } = storeToRefs(workoutStore)

const formatDate = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date(props.date)).slice(0, -3)

const cols = computed(()=> {
  let res = 'grid-template-columns: 1fr'

  for (let index = 0; index < props.approach.length; index++) {
    res += ' 1fr'
  }

  return res += ' 1fr'
})

const formattedComplexTime = computed(() => {
  const totalSeconds = Number(props.res) || 0
  const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
  const secs = (totalSeconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
})

const formattedRpe = computed(() => {
  const normalized = Number(props.rpe)
  if (!Number.isFinite(normalized) || normalized <= 0) return ''
  return `${normalized.toFixed(1).replace(/\.0$/, '')}`
})

function selectUpdate() {
  selectUpdateWorkout.value = workouts.value.find(item => item.id === props.id) || null
  router.push('/workout')
}
</script>

<template lang="pug">
.grid.w-full.py-4.px-3.text-xs.border.border-faint.rounded-xl.shadow-md(class="bg-faint/20")
  .flex.items-center.justify-between.text-accent.pb-6
    p {{ formatDate }}
    p(v-if="isComplex") На время
    p(v-else) {{ approach.length }} x {{ interval }}
    p(v-if="!isComplex") {{ ease === EnumEase.rubber ? rubber : ease }}

  .text-xs.pb-3(v-if="!isComplex && formattedRpe") RPE: {{ formattedRpe }}

  .grid(:style="cols" v-if="!isComplex")
    .text-left.py-1.pr-1(class="text-[rgb(var(--colorIcon))]/40") пвт
    .text-center.border-l.border-faint.py-1(v-for="item in approach") {{ item }}
    .text-error.text-right.border-l.border-faint.py-1.pl-1 {{ res }}
    template(v-if="ease === EnumEase.weight && Array.isArray(weight) && weight.length")
      .text-left.pr-1.py-1.border-t.border-faint(class="text-[rgb(var(--colorIcon))]/40") кг
      .text-center.border-l.border-faint.border-t.py-1(v-for="item in weight") {{ item }}
      .text-error.text-right.border-l.border-faint.border-t.py-1.pl-1 {{ resWeigth }}

  .grid.items-center.gap-3(v-else class="grid-cols-[1fr_auto]")
    .text(class="text-[rgb(var(--colorIcon))]/50") Время
    .text-error.text-base {{ formattedComplexTime }}

  .border-t.border-faint.p-2.mt-2(v-if="isComplex && Array.isArray(complexExercises) && complexExercises.length")
    .text.pb-2(class="text-[rgb(var(--colorIcon))]/50") Упражнения
    ul.list-disc.pl-5.grid.gap-1
      li(v-for="(item, idx) in complexExercises" :key="`${id}-complex-${idx}`") {{ item }}

  .border-t.border-faint.p-2.mt-2(v-if="desc") {{ desc }}

  .flex.justify-end.pt-3
    div(@click="selectUpdate")
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 511" width="20" height="20"><path fill="rgb(var(--colorAccent))" d="M405 256c-11 0-21 10-21 22v170c0 12-10 22-21 22H64c-12 0-21-10-21-22V150c0-12 9-22 21-22h171a21 21 0 1 0 0-42H64c-35 0-64 29-64 64v298c0 36 29 64 64 64h299c35 0 64-28 64-64V278c0-12-10-22-22-22zm0 0"/><path fill="rgb(var(--colorAccent))" d="M200 237a11 11 0 0 0-3 5l-15 76c-1 3 0 7 3 10a11 11 0 0 0 7 3l3-1 75-15c2 0 4-1 5-3l169-168-75-76zM496 16a53 53 0 0 0-75 0l-30 30 76 75 29-29a53 53 0 0 0 0-76zm0 0"/></svg>
</template>
