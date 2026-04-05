<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { updateData } from '~/shared/api/firebaseInit'

definePageMeta({
  backToExercise: true
})

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const exerciseStore = useExerciseStore()
const userStore = useUserStore()
const { allExercises } = storeToRefs(exerciseStore)
const { activeUser } = storeToRefs(userStore)
const { notifyError } = useNotifications()

appStore.headerTitle = 'Добавить комплекс'
useHead({ title: appStore.headerTitle })

const exerciseId = computed(() => String(route.params.id))
const exercise = computed(() => allExercises.value.find(e => e.id === exerciseId.value) || null)
const canManageComplexes = computed(() => String(activeUser.value.status || '').trim().toLowerCase() === 'admin')

const description = ref(exercise.value?.complexDesc || '')

watch(exercise, (ex) => {
  if (ex && !description.value) description.value = ex.complexDesc || ''
}, { immediate: true })

if (!exerciseId.value) {
  notifyError('Нет выбранного упражнения. Откройте упражнение из списка.')
  void router.push('/')
}

async function saveComplex() {
  if (!canManageComplexes.value) {
    notifyError('Только пользователь со статусом admin может создавать комплексы')
    return
  }

  const complexDesc = description.value.trim()
  if (!complexDesc) {
    notifyError('Добавьте описание комплекса')
    return
  }

  try {
    await updateData(`exercises/${exerciseId.value}`, { isComplex: true, complexDesc })

    const idx = allExercises.value.findIndex(e => e.id === exerciseId.value)
    if (idx >= 0) {
      allExercises.value[idx] = { ...allExercises.value[idx], isComplex: true, complexDesc }
    }

    await router.push(`/exercise/${exerciseId.value}`)
  } catch (e) {
    console.error('[firebase:saveComplex]', e)
    notifyError('Не удалось сохранить комплекс. Попробуйте снова.')
  }
}
</script>

<template>
<div class="flex flex-col gap-3 min-h-full">
  <div v-if="!canManageComplexes" class="text-sm text-error">
    Добавление комплексов доступно только пользователю со статусом admin
  </div>
  <UiInput
    v-model="description"
    type="textarea"
    placeholder="Описание комплекса"
    class="min-h-[200px]"
  />
  <UiButton
    v-if="canManageComplexes"
    text="Сохранить комплекс"
    @click="saveComplex"
  />
</div>
</template>
