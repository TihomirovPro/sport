<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { updateData } from '~/composables/firebaseInit'
import type { TypeExercise } from '~/composables/types'

definePageMeta({
  backTo: '/exercise-item'
})

const appStore = useAppStore()
const exerciseStore = useExerciseStore()
const userStore = useUserStore()
const { activeExercise, allExercises } = storeToRefs(exerciseStore)
const { activeUser } = storeToRefs(userStore)
const router = useRouter()
const { notifyError } = useNotifications()

appStore.headerTitle = 'Добавить комплекс'
useHead({
  title: appStore.headerTitle
})

interface TypeComplex {
  exerciseId: string
  description: string
}

const complex = ref<TypeComplex>({
  exerciseId: activeExercise.value?.id || '',
  description: activeExercise.value?.complexDesc || ''
})
const canManageComplexes = computed(() => String(activeUser.value.status || '').trim().toLowerCase() === 'admin')

if (!complex.value.exerciseId) {
  notifyError('Нет выбранного упражнения. Откройте упражнение из списка.')
  void router.push('/')
}

async function saveComplex() {
  if (!canManageComplexes.value) {
    notifyError('Только пользователь со статусом admin может создавать комплексы')
    return
  }

  const exerciseId = complex.value.exerciseId
  const complexDesc = complex.value.description.trim()

  if (!exerciseId) {
    notifyError('Не удалось определить комплекс для сохранения')
    return
  }

  if (!complexDesc) {
    notifyError('Добавьте описание комплекса')
    return
  }

  try {
    await updateData(`exercises/${exerciseId}`, {
      isComplex: true,
      complexDesc,
    })

    if (activeExercise.value?.id === exerciseId) {
      activeExercise.value = {
        ...activeExercise.value,
        isComplex: true,
        complexDesc,
      } as TypeExercise
      localStorage.setItem('activeExercise', JSON.stringify(activeExercise.value))
    }

    const idx = allExercises.value.findIndex((item) => item.id === exerciseId)
    if (idx >= 0) {
      allExercises.value[idx] = {
        ...allExercises.value[idx],
        isComplex: true,
        complexDesc,
      }
    }

    await router.push('/exercise-item')
  } catch (error) {
    console.error('[firebase:saveComplex]', error)
    notifyError('Не удалось сохранить комплекс. Попробуйте снова.')
  }
}
</script>

<template lang="pug">
.flex.flex-col.gap-3.min-h-full
  .text-sm.text-error(v-if="!canManageComplexes") Добавление комплексов доступно только пользователю со статусом admin
  BaseInput(
    v-model="complex.description"
    type="textarea"
    placeholder="Описание комплекса"
    class="min-h-[200px]"
  )

  BaseButton(
    v-if="canManageComplexes"
    text="Сохранить комплекс"
    @click="saveComplex"
  ).mt-auto
</template>

<style lang="stylus" scoped>
</style>
