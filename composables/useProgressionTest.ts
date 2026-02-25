export interface ProgressionProfile {
  sets: number
  intervalMinutes: number
  repMin: number
  repMax: number
  incrementKg: number
}

export interface ProgressionSession {
  id: string
  exerciseId: string
  date: number
  profileKey: string
  reps: number[]
  weights: number[]
  rpe: number
}

export type SuggestionMode = 'increase' | 'hold' | 'decrease' | 'bootstrap'

export interface ProgressionSuggestion {
  mode: SuggestionMode
  profileKey: string
  basedOnSessions: number
  nextWeights: number[]
  targetReps: number
  reason: string
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

function roundToIncrement(value: number, increment: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (!Number.isFinite(increment) || increment <= 0) return Math.round(value * 100) / 100
  const rounded = Math.round(value / increment) * increment
  return Math.round(rounded * 100) / 100
}

export function buildProfileKey(profile: ProgressionProfile): string {
  const safeSets = clamp(Math.round(profile.sets || 0), 1, 12)
  const safeInterval = Math.round((profile.intervalMinutes || 0) * 10) / 10
  return `sets:${safeSets}|interval:${safeInterval}`
}

function normalizeProfile(profile: ProgressionProfile): ProgressionProfile {
  const sets = clamp(Math.round(profile.sets || 0), 1, 12)
  const intervalMinutes = Math.max(0, Math.round((profile.intervalMinutes || 0) * 10) / 10)
  const repMin = clamp(Math.round(profile.repMin || 0), 1, 100)
  const repMax = clamp(Math.round(profile.repMax || 0), repMin, 100)
  const incrementKg = Math.max(0.25, Math.round((profile.incrementKg || 0.25) * 100) / 100)

  return { sets, intervalMinutes, repMin, repMax, incrementKg }
}

function sanitizeSession(session: ProgressionSession, expectedSets: number): ProgressionSession | null {
  if (!Array.isArray(session.reps) || !Array.isArray(session.weights)) return null
  if (session.reps.length !== expectedSets || session.weights.length !== expectedSets) return null

  const reps = session.reps.map((item) => Number(item))
  const weights = session.weights.map((item) => Number(item))
  const hasInvalidReps = reps.some((item) => !Number.isFinite(item) || item <= 0)
  const hasInvalidWeights = weights.some((item) => !Number.isFinite(item) || item < 0)
  const normalizedRpe = Number(session.rpe)

  if (hasInvalidReps || hasInvalidWeights || !Number.isFinite(normalizedRpe)) return null

  return {
    ...session,
    reps,
    weights,
    rpe: clamp(Math.round(normalizedRpe * 10) / 10, 1, 10)
  }
}

export function computeProgressionSuggestion(
  sessions: ProgressionSession[],
  exerciseId: string,
  profileInput: ProgressionProfile
): ProgressionSuggestion {
  const profile = normalizeProfile(profileInput)
  const profileKey = buildProfileKey(profile)

  const history = sessions
    .filter((session) => session.exerciseId === exerciseId && session.profileKey === profileKey)
    .map((session) => sanitizeSession(session, profile.sets))
    .filter((session): session is ProgressionSession => Boolean(session))
    .sort((a, b) => b.date - a.date)

  if (!history.length) {
    return {
      mode: 'bootstrap',
      profileKey,
      basedOnSessions: 0,
      nextWeights: new Array(profile.sets).fill(0),
      targetReps: profile.repMin,
      reason: 'Нет истории по этому профилю. Начни с комфортного стартового веса.'
    }
  }

  const latest = history[0]
  const minReps = Math.min(...latest.reps)
  const latestWeights = latest.weights.map((item) => roundToIncrement(item, profile.incrementKg))
  const baseTargetReps = clamp(minReps, profile.repMin, profile.repMax)
  const basedOnSessions = history.length

  if (history.length < 2) {
    return {
      mode: 'bootstrap',
      profileKey,
      basedOnSessions,
      nextWeights: latestWeights,
      targetReps: baseTargetReps,
      reason: 'Мало данных по профилю. Повтори вес и стабилизируй технику.'
    }
  }

  const perSession = history.map((item) => {
    const sessionMinReps = Math.min(...item.reps)
    return {
      minReps: sessionMinReps,
      success: sessionMinReps >= profile.repMax && item.rpe <= 8,
      overload: sessionMinReps < profile.repMin || item.rpe >= 9.5
    }
  })

  const successCount = perSession.filter((item) => item.success).length
  const overloadCount = perSession.filter((item) => item.overload).length
  const successRate = successCount / basedOnSessions
  const overloadRate = overloadCount / basedOnSessions
  const avgRpe = history.reduce((sum, item) => sum + item.rpe, 0) / basedOnSessions
  const stagnation = overloadRate >= 0.5 && avgRpe >= 9

  if (stagnation || minReps < profile.repMin || latest.rpe >= 9.5) {
    return {
      mode: 'decrease',
      profileKey,
      basedOnSessions,
      nextWeights: latestWeights.map((weight) => roundToIncrement(weight * 0.95, profile.incrementKg)),
      targetReps: profile.repMin,
      reason: stagnation
        ? 'По истории много перегруза. Рекомендуется небольшой шаг назад.'
        : 'Высокий RPE или недобор повторов. Лучше снизить вес.'
    }
  }

  if (minReps >= profile.repMax && latest.rpe <= 8 && successRate >= 0.4) {
    return {
      mode: 'increase',
      profileKey,
      basedOnSessions,
      nextWeights: latestWeights.map((weight) => roundToIncrement(weight + profile.incrementKg, profile.incrementKg)),
      targetReps: profile.repMin,
      reason: 'Верх диапазона достигнут при комфортном RPE. Можно добавить вес.'
    }
  }

  return {
    mode: 'hold',
    profileKey,
    basedOnSessions,
    nextWeights: latestWeights,
    targetReps: clamp(baseTargetReps + 1, profile.repMin, profile.repMax),
    reason: 'Оставь вес, попробуй добавить 1 повтор в подходе.'
  }
}
