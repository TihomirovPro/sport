<script setup lang="ts">
import type { TypeExercise } from '~/composables/types'

const props = defineProps<TypeExercise>()

const isShowModalExercise = useShowModalExercise()
const updateExercise = useSelectUpdateExercise()
const activeExercise = useActiveExercise()

const a = ref({"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"A","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"})

const slug = computed(() => {
  return props.name.split('').map(function (char) { 
    return a.value[char] || char; 
  }).join("").toLocaleLowerCase()
})

function update() {
  updateExercise.value = props
  isShowModalExercise.value = true
}

async function active() {
  activeExercise.value = props
  await getWorkouts(props.id)
}
</script>

<template lang="pug">
.grid.gap-5.items-center(
  class="grid-cols-[56px_1fr]"
)
  .flex-center.size-14.text-4xl.p-1.rounded-xl.uppercase.text-white(
    class="bg-[#5182dc]"
    :style="`background: ${color}`"
    @click="update"
  )
    .text-2xl(v-if="!icon") {{ name[0] }}
    Icon(v-else :icon="icon" color="#fff")

  NuxtLink.cursor-pointer.py-6.text-xl.border-b(
    class="text-[#5182dc] border-[rgba(#dcdcdc,.5)]"
    @click="active"
    :to="`/exercise-${slug}`"
  ) {{ name }}
</template>
