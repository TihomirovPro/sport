<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { updateData, removeData } from '~/shared/api/firebaseInit'
import type { TypeExerciseCreate } from '~/features/exercise/model/types'
import { EnumEase } from '~/shared/config/enums'

definePageMeta({
  backToExercise: true
})

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const exerciseStore = useExerciseStore()
const workoutStore = useWorkoutStore()
const userStore = useUserStore()
const { allExercises } = storeToRefs(exerciseStore)
const { workouts } = storeToRefs(workoutStore)
const { activeUser } = storeToRefs(userStore)
const { notifyError } = useNotifications()
const { t } = useI18n()

const exerciseId = computed(() => String(route.params.id))
const sourceExercise = computed(() => allExercises.value.find(e => e.id === exerciseId.value) || null)

const showModalColor = ref<boolean>(false)
const showModalIcon = ref<boolean>(false)
const error = ref<boolean>(false)
const removeConfirm = ref<boolean>(false)
const isSaving = ref<boolean>(false)
const text = ref<string>('')

const constEases = [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]

const exercise = ref<TypeExerciseCreate>({
  name: '',
  color: '',
  icon: '',
  ease: constEases,
  isComplex: false,
  complexDesc: '',
  complexItems: [],
  order: 0
})

watch(sourceExercise, (newExercise) => {
  if (newExercise) {
    const { id: _id, ...data } = newExercise
    exercise.value = { ...data }
    if (!exercise.value.ease) exercise.value.ease = constEases
    if (!exercise.value.complexItems) exercise.value.complexItems = []
    appStore.headerTitle = exercise.value.isComplex ? t('exercises.editComplexTitle') : t('exercises.editTitle')
  }
}, { immediate: true })

useHead(() => ({ title: appStore.headerTitle }))

onMounted(() => {
  if (!exerciseId.value) {
    void router.push('/')
    return
  }
  getWorkouts(exerciseId.value)
})

onUnmounted(() => {
  stopWorkoutsSubscription()
})

async function update() {
  if (isSaving.value) return
  if (!validateExercise()) return

  isSaving.value = true
  try {
    if (exercise.value.order === undefined) exercise.value.order = allExercises.value.length
    if (exercise.value.isComplex === undefined) exercise.value.isComplex = false
    if (exercise.value.complexDesc === undefined) exercise.value.complexDesc = ''
    if (!exercise.value.complexItems) exercise.value.complexItems = []
    await updateData(`exercises/${exerciseId.value}`, exercise.value)
    await router.push('/')
  } catch (e) {
    console.error('[firebase:updateExercise]', e)
    notifyError(t('exercises.errorSaveFailed'))
  } finally {
    isSaving.value = false
  }
}

async function remove() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    await removeData(`workout/${exerciseId.value}`)
    await removeData(`exercises/${exerciseId.value}`)
    removeConfirm.value = false
    await router.push('/')
  } catch (e) {
    console.error('[firebase:removeExercise]', e)
    notifyError(t('exercises.errorDeleteFailed'))
  } finally {
    isSaving.value = false
  }
}

function deleted() {
  if (isSaving.value) return
  text.value = workouts.value.length
    ? t('exercises.deleteConfirmWithData')
    : t('exercises.deleteConfirm')
  removeConfirm.value = true
}

function selectColor(color: string) {
  exercise.value.color = color
  showModalColor.value = false
}

function selectIcon(icon: string) {
  exercise.value.icon = icon
  showModalIcon.value = false
}

function selectEase(ease: EnumEase) {
  if (exercise.value.ease.includes(ease)) exercise.value.ease = exercise.value.ease.filter(el => el !== ease)
  else exercise.value.ease = [...exercise.value.ease, ease]
}

function toggleComplex() {
  exercise.value.isComplex = !exercise.value.isComplex
  if (!exercise.value.isComplex) {
    exercise.value.complexDesc = ''
    exercise.value.complexItems = []
  }
}

function addComplexItem() {
  if (!Array.isArray(exercise.value.complexItems)) exercise.value.complexItems = []
  exercise.value.complexItems.push('')
}

function removeComplexItem(idx: number) {
  if (!Array.isArray(exercise.value.complexItems)) return
  exercise.value.complexItems.splice(idx, 1)
}

function validateExercise(): boolean {
  const name = exercise.value.name.trim()
  if (!name) {
    error.value = true
    notifyError(t('exercises.errorNoName'))
    return false
  }
  exercise.value.name = name
  if (!Array.isArray(exercise.value.ease) || exercise.value.ease.length === 0) {
    notifyError(t('exercises.errorNoEase'))
    return false
  }
  exercise.value.complexDesc = exercise.value.isComplex ? (exercise.value.complexDesc?.trim() || '') : ''
  exercise.value.complexItems = exercise.value.isComplex
    ? (exercise.value.complexItems ?? []).map(s => s.trim()).filter(Boolean)
    : []
  error.value = false
  return true
}

watch(() => exercise.value.name, (name) => {
  if (name.trim()) error.value = false
})
</script>

<template>
  <div class="flex flex-col gap-4 h-full">

    <div class="flex items-center gap-3">
      <div
        class="size-14 rounded-xl flex-center flex-shrink-0 p-2 bg-accent"
        :style="exercise.color ? `background: ${exercise.color}` : ''"
      >
        <UiIcon v-if="exercise.icon" :icon="exercise.icon" color="#fff" />
        <div v-else class="text-white text-2xl font-medium">{{ exercise.name[0] || '?' }}</div>
      </div>
      <UiInput
        v-model="exercise.name"
        type="text"
        :error="error"
        :placeholder="t('exercises.namePlaceholder')"
      />
    </div>

    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold uppercase opacity-40 px-1 pb-1">{{ t('exercises.appearance') }}</p>
      <div class="flex flex-col rounded-xl overflow-hidden border border-faint">
        <UiSettingsItem :label="t('exercises.color')" @click="showModalColor = true">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </template>
          <div class="flex items-center gap-2">
            <div
              class="size-5 rounded-full shrink-0"
              :class="!exercise.color ? 'bg-accent' : ''"
              :style="exercise.color ? `background: ${exercise.color}` : ''"
            />
            <svg class="opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </UiSettingsItem>

        <div class="h-px bg-faint mx-4" />

        <UiSettingsItem :label="t('exercises.icon')" @click="showModalIcon = true">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </template>
          <div class="flex items-center gap-2">
            <div v-if="exercise.icon" class="size-5 shrink-0">
              <UiIcon :icon="exercise.icon" color="currentColor" />
            </div>
            <svg class="opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </UiSettingsItem>
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold uppercase opacity-40 px-1 pb-1">{{ t('exercises.loadType') }}</p>
      <div class="flex flex-col rounded-xl overflow-hidden border border-faint">

        <UiSettingsItem :label="t('ease.noWeight')" @click="selectEase(EnumEase.noWeight)">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="7" r="4" />
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
          </template>
          <UiToggle
            :modelValue="exercise.ease.includes(EnumEase.noWeight)"
            @update:modelValue="selectEase(EnumEase.noWeight)"
          />
        </UiSettingsItem>

        <div class="h-px bg-faint mx-4" />

        <UiSettingsItem :label="t('ease.weight')" @click="selectEase(EnumEase.weight)">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="6" y1="9" x2="6" y2="15" />
              <line x1="18" y1="9" x2="18" y2="15" />
              <line x1="4" y1="10" x2="4" y2="14" />
              <line x1="20" y1="10" x2="20" y2="14" />
            </svg>
          </template>
          <UiToggle
            :modelValue="exercise.ease.includes(EnumEase.weight)"
            @update:modelValue="selectEase(EnumEase.weight)"
          />
        </UiSettingsItem>

        <div class="h-px bg-faint mx-4" />

        <UiSettingsItem :label="t('ease.rubber')" @click="selectEase(EnumEase.rubber)">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </template>
          <UiToggle
            :modelValue="exercise.ease.includes(EnumEase.rubber)"
            @update:modelValue="selectEase(EnumEase.rubber)"
          />
        </UiSettingsItem>
      </div>
    </div>

    <div v-if="exercise.isComplex" class="flex flex-col gap-1">
      <p class="text-xs font-semibold uppercase opacity-40 px-1 pb-1">{{ t('exercises.complexSection') }}</p>
      <div class="flex flex-col rounded-xl overflow-hidden border border-faint">
        <UiSettingsItem :label="t('exercises.complexLabel')" @click="toggleComplex">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </template>
          <UiToggle :modelValue="exercise.isComplex" @update:modelValue="toggleComplex" />
        </UiSettingsItem>

        <template v-if="exercise.isComplex">
          <div class="h-px bg-faint" />
          <div class="px-4 py-3">
            <UiInput
              v-model="exercise.complexDesc"
              type="textarea"
              :placeholder="t('exercises.description')"
            />
          </div>
          <div class="h-px bg-faint mx-4" />
          <div class="px-4 pt-3 pb-1">
            <p class="text-xs font-semibold uppercase opacity-40">{{ t('exercises.exercisesSubheader') }}</p>
          </div>
          <div
            v-for="(item, idx) in exercise.complexItems"
            :key="`ci-${idx}`"
            class="flex items-center gap-2 px-3 py-2 border-t border-faint"
          >
            <UiInput v-model="(exercise.complexItems as string[])[idx]" type="text" :placeholder="t('exercises.exercisePlaceholder')" />
            <button
              type="button"
              class="text-xs text-error shrink-0 px-2 py-1"
              @click="removeComplexItem(idx)"
            >—</button>
          </div>
          <div class="px-4 py-3 border-t border-faint">
            <UiButton :text="t('exercises.addExerciseItem')" @click="addComplexItem" />
          </div>
        </template>
      </div>
    </div>

    <div class="mt-auto flex gap-3">
      <UiButton
        red
        :disabled="isSaving"
        :text="t('exercises.deleteExercise')"
        @click="deleted"
      />
      <UiButton
        :text="isSaving ? t('common.saving') : t('common.save')"
        :disabled="isSaving"
        @click="update"
      />
    </div>

    <UiModalRemoveConfirm
      :text="text"
      :isShow="removeConfirm"
      @hiden="removeConfirm = false"
      @cancelRemove="removeConfirm = false"
      @remove="remove"
    />

    <UiModalColor
      :isShow="showModalColor"
      :activeColor="exercise.color"
      @hiden="showModalColor = false"
      @selectColor="(color) => selectColor(color)"
    />

    <ModalIcon
      :isShow="showModalIcon"
      :activeIcon="exercise.icon"
      @hiden="showModalIcon = false"
      @selectIcon="(icon) => selectIcon(icon)"
    />
  </div>
</template>
