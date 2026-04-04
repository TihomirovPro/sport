import { onData, updateData } from '~/shared/api/firebaseInit'
import { safeParseJson } from '~/composables/useWorkoutHelpers'
import type { Ref } from 'vue'
import { IDB_KEYS } from '~/shared/config/storageKeys'
import { idbStorage } from '~/shared/api/storage/idb'

const PROGRESSION_SETTINGS_STORAGE_KEY = IDB_KEYS.PROGRESSION_SETTINGS

type ProgressionSettings = {
  repMin?: number
  repMax?: number
}

type UseWorkoutProgressionSettingsParams = {
  activeExerciseId: Readonly<Ref<string>>
  canManageProgression: Readonly<Ref<boolean>>
}

function progressionSettingsKey(exerciseId: string): string {
  const normalizedExerciseId = String(exerciseId || 'default').trim() || 'default'
  return `${PROGRESSION_SETTINGS_STORAGE_KEY}:${normalizedExerciseId}`
}

function progressionSettingsPathFor(exerciseId: string): string {
  return `progression/settings/${exerciseId}`
}

export function useWorkoutProgressionSettings(params: UseWorkoutProgressionSettingsParams) {
  const progressionRepMin = ref(6)
  const progressionRepMax = ref(8)
  const isApplyingRemoteProgressionSettings = ref(false)
  const progressionSettingsUnsubscribe = ref<(() => void) | null>(null)

  function stopProgressionSettingsSubscription() {
    if (!progressionSettingsUnsubscribe.value) return
    progressionSettingsUnsubscribe.value()
    progressionSettingsUnsubscribe.value = null
  }

  function loadProgressionSettings(exerciseId: string) {
    if (!process.client) return

    const raw = idbStorage.getItem(progressionSettingsKey(exerciseId))
    if (!raw) return

    const parsed = safeParseJson<ProgressionSettings>(raw, {})
    if (Number.isFinite(parsed.repMin)) progressionRepMin.value = Number(parsed.repMin)
    if (Number.isFinite(parsed.repMax)) progressionRepMax.value = Number(parsed.repMax)
  }

  function saveProgressionSettings(exerciseId: string) {
    if (!process.client) return

    idbStorage.setItem(progressionSettingsKey(exerciseId), JSON.stringify({
      repMin: progressionRepMin.value,
      repMax: progressionRepMax.value
    }))
  }

  function subscribeProgressionSettings(exerciseId: string) {
    if (!exerciseId) return

    stopProgressionSettingsSubscription()

    progressionSettingsUnsubscribe.value = onData(progressionSettingsPathFor(exerciseId), (snapshot) => {
      const data = snapshot.val() as ProgressionSettings | null
      if (!data) return

      isApplyingRemoteProgressionSettings.value = true
      if (Number.isFinite(Number(data.repMin))) progressionRepMin.value = Number(data.repMin)
      if (Number.isFinite(Number(data.repMax))) progressionRepMax.value = Number(data.repMax)
      isApplyingRemoteProgressionSettings.value = false
      saveProgressionSettings(exerciseId)
    })
  }

  const initialExerciseId = params.activeExerciseId.value
  loadProgressionSettings(initialExerciseId)
  subscribeProgressionSettings(initialExerciseId)

  watch(
    [progressionRepMin, progressionRepMax],
    () => {
      progressionRepMin.value = Math.max(1, Math.round(progressionRepMin.value || 1))
      progressionRepMax.value = Math.max(progressionRepMin.value, Math.round(progressionRepMax.value || progressionRepMin.value))

      const exerciseId = params.activeExerciseId.value
      saveProgressionSettings(exerciseId)

      if (isApplyingRemoteProgressionSettings.value) return
      if (!params.canManageProgression.value) return
      if (!exerciseId) return

      void updateData(progressionSettingsPathFor(exerciseId), {
        repMin: progressionRepMin.value,
        repMax: progressionRepMax.value,
        updatedAt: Date.now()
      }).catch((error) => {
        console.error('[firebase:saveProgressionSettings]', error)
      })
    }
  )

  watch(
    () => params.activeExerciseId.value,
    (exerciseId) => {
      loadProgressionSettings(exerciseId)
      subscribeProgressionSettings(exerciseId)
    }
  )

  onUnmounted(() => {
    stopProgressionSettingsSubscription()
  })

  return {
    progressionRepMin,
    progressionRepMax
  }
}
