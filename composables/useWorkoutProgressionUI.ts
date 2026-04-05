import type { ComputedRef, Ref } from 'vue'
import { createData } from '~/shared/api/firebaseInit'
import {
  buildProfileKey,
  computeBodyweightRepsSuggestion,
  computeProgressionSuggestion,
  type ProgressionSession
} from '~/composables/useProgressionTest'
import { parseIntervalMinutes } from '~/composables/useWorkoutHelpers'
import { EnumEase, type TypeExercise, type TypeWorkout, type TypeWorkoutCreate } from '~/composables/types'

interface UseWorkoutProgressionUIParams {
  activeUser: Ref<{ status?: string } | null | undefined>
  exercise: Ref<TypeExercise | null | undefined>
  selectUpdateWorkout: Ref<TypeWorkout | null>
  workouts: Ref<TypeWorkout[]>
  workout: Ref<TypeWorkoutCreate>
  approaches: Ref<number>
  isComplex: ComputedRef<boolean>
  notifyError: (message: string) => void
}

export function useWorkoutProgressionUI({
  activeUser,
  exercise,
  selectUpdateWorkout,
  workouts,
  workout,
  approaches,
  isComplex,
  notifyError
}: UseWorkoutProgressionUIParams) {
  const canManageProgression = computed(() => String(activeUser.value?.status || '').trim().toLowerCase() === 'admin')
  const isWeightMode = computed(() => workout.value.ease === EnumEase.weight)
  const isBodyweightMode = computed(() => workout.value.ease === EnumEase.noWeight)

  const progressionProfile = computed(() => {
    return {
      sets: Math.max(1, Math.round(approaches.value || 1)),
      intervalMinutes: parseIntervalMinutes(workout.value.interval)
    }
  })

  const progressionWeightSessions = computed<ProgressionSession[]>(() => {
    const exerciseId = exercise.value?.id ?? ''

    return workouts.value
      .filter((item) =>
        item.exercisesId === exerciseId &&
        item.ease === EnumEase.weight &&
        Array.isArray(item.weight) &&
        item.weight.length === item.approach.length &&
        item.approach.length > 0
      )
      .map((item) => ({
        id: item.id,
        exerciseId: item.exercisesId,
        date: item.date,
        profileKey: buildProfileKey({
          sets: item.approach.length,
          intervalMinutes: parseIntervalMinutes(item.interval)
        }),
        reps: [...item.approach],
        weights: [...(item.weight || [])],
        rpe: Number.isFinite(Number(item.rpe)) ? Number(item.rpe) : 8
      }))
  })

  const progressionBodyweightSessions = computed<ProgressionSession[]>(() => {
    const exerciseId = exercise.value?.id ?? ''

    return workouts.value
      .filter((item) =>
        item.exercisesId === exerciseId &&
        item.ease === EnumEase.noWeight &&
        Array.isArray(item.approach) &&
        item.approach.length > 0
      )
      .map((item) => ({
        id: item.id,
        exerciseId: item.exercisesId,
        date: item.date,
        profileKey: buildProfileKey({
          sets: item.approach.length,
          intervalMinutes: parseIntervalMinutes(item.interval)
        }),
        reps: [...item.approach],
        weights: new Array(item.approach.length).fill(0),
        rpe: Number.isFinite(Number(item.rpe)) ? Number(item.rpe) : 8
      }))
  })

  const progressionSuggestion = computed(() => {
    return computeProgressionSuggestion(
      progressionWeightSessions.value,
      exercise.value?.id ?? '',
      progressionProfile.value
    )
  })

  const bodyweightSuggestion = computed(() => {
    return computeBodyweightRepsSuggestion(
      progressionBodyweightSessions.value,
      exercise.value?.id ?? '',
      progressionProfile.value
    )
  })

  const hasSuggestionData = computed(() => {
    if (isWeightMode.value) return progressionSuggestion.value.basedOnSessions > 0
    return bodyweightSuggestion.value.basedOnSessions > 0
  })

  const canShowProgression = computed(() => {
    return canManageProgression.value
      && !selectUpdateWorkout.value
      && !isComplex.value
      && (isWeightMode.value || isBodyweightMode.value)
      && hasSuggestionData.value
  })

  function suggestionActionText(mode: string, type: 'weight' | 'bodyweight'): string {
    if (type === 'weight') {
      if (mode === 'increase') return 'Повышаем рабочий вес'
      if (mode === 'decrease') return 'Снижаем рабочий вес'
      if (mode === 'hold') return 'Оставляем текущий вес'
      return 'Собираем базовую историю'
    }

    if (mode === 'increase') return 'Повышаем рабочий объем'
    if (mode === 'decrease') return 'Снижаем рабочий объем'
    if (mode === 'hold') return 'Оставляем текущий объем'
    return 'Собираем базовую историю'
  }

  function suggestionSummaryText(mode: string, reason: string, type: 'weight' | 'bodyweight'): string {
    const action = suggestionActionText(mode, type)
    const normalizedReason = String(reason || '').trim()
    if (!normalizedReason) return action
    return `${action}. ${normalizedReason}`
  }

  const activeSuggestionMode = computed(() => {
    if (isWeightMode.value) return progressionSuggestion.value.mode
    return bodyweightSuggestion.value.mode
  })

  const activeSuggestionReason = computed(() => {
    if (isWeightMode.value) return progressionSuggestion.value.reason
    return bodyweightSuggestion.value.reason
  })

  const activeSuggestionConfidenceLevel = computed(() => {
    if (isWeightMode.value) return progressionSuggestion.value.confidenceLevel
    return bodyweightSuggestion.value.confidenceLevel
  })

  const activeSuggestionConfidenceScore = computed(() => {
    if (isWeightMode.value) return progressionSuggestion.value.confidenceScore
    return bodyweightSuggestion.value.confidenceScore
  })

  const activeSuggestionDroppedSessions = computed(() => {
    if (isWeightMode.value) return progressionSuggestion.value.validationDroppedSessions
    return bodyweightSuggestion.value.validationDroppedSessions
  })

  function confidenceLabel(level: 'low' | 'medium' | 'high'): string {
    if (level === 'high') return 'высокая'
    if (level === 'medium') return 'средняя'
    return 'низкая'
  }

  const activeSuggestionConfidenceLine = computed(() => {
    const scorePercent = Math.round((activeSuggestionConfidenceScore.value || 0) * 100)
    const dropped = Math.max(0, Math.round(activeSuggestionDroppedSessions.value || 0))
    const droppedPart = dropped > 0 ? `, исключено сессий: ${dropped}` : ''
    return `Надёжность: ${confidenceLabel(activeSuggestionConfidenceLevel.value)} (${scorePercent}%)${droppedPart}`
  })

  const activeSuggestionSummaryText = computed(() => suggestionSummaryText(
    activeSuggestionMode.value,
    activeSuggestionReason.value,
    isWeightMode.value ? 'weight' : 'bodyweight'
  ))

  const normalizedSuggestionWeights = computed(() => {
    return progressionSuggestion.value.nextWeights.map((item) => {
      const numeric = Number(item)
      if (!Number.isFinite(numeric)) return 0
      return Math.max(0, Math.round(numeric))
    })
  })

  const recommendationWeightsLine = computed(() => normalizedSuggestionWeights.value.join(' / '))

  const recommendationRepsLine = computed(() => {
    if (isWeightMode.value) {
      return progressionSuggestion.value.nextReps.join(' / ')
    }

    return bodyweightSuggestion.value.nextReps.join(' / ')
  })

  function applyProgressionSuggestion() {
    if (!canShowProgression.value) {
      notifyError('Автопрогрессия доступна только пользователю со статусом admin')
      return
    }

    if (isWeightMode.value) {
      const suggestedWeights = normalizedSuggestionWeights.value
      const suggestedReps = progressionSuggestion.value.nextReps
      if (!suggestedWeights.length) return

      workout.value.weight = [...suggestedWeights]
      if (suggestedReps.length === approaches.value) {
        workout.value.approach = [...suggestedReps]
      }
    } else {
      const suggestedReps = bodyweightSuggestion.value.nextReps
      if (!suggestedReps.length) return
      workout.value.approach = [...suggestedReps]
    }

    const exerciseId = String(exercise.value?.id || '').trim()
    if (!exerciseId) return

    const payload = {
      exerciseId,
      profileKey: isWeightMode.value ? progressionSuggestion.value.profileKey : bodyweightSuggestion.value.profileKey,
      mode: activeSuggestionMode.value,
      adaptiveState: isWeightMode.value ? progressionSuggestion.value.adaptiveState : null,
      adaptiveIncrementKg: isWeightMode.value ? progressionSuggestion.value.adaptiveIncrementKg : null,
      targetReps: isWeightMode.value ? progressionSuggestion.value.targetReps : null,
      nextWeights: isWeightMode.value ? normalizedSuggestionWeights.value : null,
      nextReps: isWeightMode.value ? progressionSuggestion.value.nextReps : bodyweightSuggestion.value.nextReps,
      basedOnSessions: isWeightMode.value ? progressionSuggestion.value.basedOnSessions : bodyweightSuggestion.value.basedOnSessions,
      confidenceLevel: activeSuggestionConfidenceLevel.value,
      confidenceScore: activeSuggestionConfidenceScore.value,
      validationDroppedSessions: activeSuggestionDroppedSessions.value,
      lastWorkoutRpe: Number.isFinite(Number(workout.value.rpe)) ? Number(workout.value.rpe) : null,
      appliedAt: Date.now()
    }

    void createData('progression/appliedSuggestions', payload).catch((error) => {
      console.error('[firebase:progressionAppliedSuggestion]', error)
    })
  }

  return {
    canShowProgression,
    isWeightMode,
    activeSuggestionSummaryText,
    activeSuggestionConfidenceLine,
    recommendationWeightsLine,
    recommendationRepsLine,
    applyProgressionSuggestion
  }
}
