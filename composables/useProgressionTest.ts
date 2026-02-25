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
  adaptiveWindow: number
  adaptiveIncrementKg: number
  adaptiveState: 'conservative' | 'neutral' | 'aggressive'
  nextWeights: number[]
  targetReps: number
  reason: string
}

export interface ProgressionRepsSuggestion {
  mode: SuggestionMode
  profileKey: string
  basedOnSessions: number
  nextReps: number[]
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

function roundToQuarter(value: number): number {
  const normalized = Math.round((value / 0.25)) * 0.25
  return Math.round(normalized * 100) / 100
}

function computeAdaptiveIncrement(
  baseIncrement: number,
  successRate: number,
  overloadRate: number,
  avgRpe: number,
  sessionsCount: number
): { incrementKg: number, state: 'conservative' | 'neutral' | 'aggressive' } {
  if (sessionsCount < 4) {
    return { incrementKg: baseIncrement, state: 'neutral' }
  }

  if (overloadRate >= 0.35 || avgRpe >= 9) {
    return {
      incrementKg: Math.max(0.25, roundToQuarter(baseIncrement * 0.5)),
      state: 'conservative'
    }
  }

  if (successRate >= 0.55 && overloadRate <= 0.15 && avgRpe <= 8.2) {
    return {
      incrementKg: Math.min(5, roundToQuarter(baseIncrement * 1.5)),
      state: 'aggressive'
    }
  }

  return { incrementKg: baseIncrement, state: 'neutral' }
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
      adaptiveWindow: 0,
      adaptiveIncrementKg: profile.incrementKg,
      adaptiveState: 'neutral',
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
      adaptiveWindow: basedOnSessions,
      adaptiveIncrementKg: profile.incrementKg,
      adaptiveState: 'neutral',
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
  const adaptive = computeAdaptiveIncrement(profile.incrementKg, successRate, overloadRate, avgRpe, basedOnSessions)
  const stepKg = adaptive.incrementKg
  const stagnation = overloadRate >= 0.5 && avgRpe >= 9

  if (stagnation || minReps < profile.repMin || latest.rpe >= 9.5) {
    return {
      mode: 'decrease',
      profileKey,
      basedOnSessions,
      adaptiveWindow: basedOnSessions,
      adaptiveIncrementKg: stepKg,
      adaptiveState: adaptive.state,
      nextWeights: latestWeights.map((weight) => roundToIncrement(weight - stepKg, profile.incrementKg)),
      targetReps: profile.repMin,
      reason: stagnation
        ? 'По истории много перегруза. Рекомендуется шаг назад.'
        : 'Высокий RPE или недобор повторов. Лучше снизить вес.'
    }
  }

  if (minReps >= profile.repMax && latest.rpe <= 8 && successRate >= 0.4) {
    return {
      mode: 'increase',
      profileKey,
      basedOnSessions,
      adaptiveWindow: basedOnSessions,
      adaptiveIncrementKg: stepKg,
      adaptiveState: adaptive.state,
      nextWeights: latestWeights.map((weight) => roundToIncrement(weight + stepKg, profile.incrementKg)),
      targetReps: profile.repMin,
      reason: 'Верх диапазона достигнут при комфортном RPE. Можно добавить вес.'
    }
  }

  return {
    mode: 'hold',
    profileKey,
    basedOnSessions,
    adaptiveWindow: basedOnSessions,
    adaptiveIncrementKg: stepKg,
    adaptiveState: adaptive.state,
    nextWeights: latestWeights,
    targetReps: clamp(baseTargetReps + 1, profile.repMin, profile.repMax),
    reason: 'Оставь вес, попробуй добавить 1 повтор в подходе.'
  }
}

export function computeBodyweightRepsSuggestion(
  sessions: ProgressionSession[],
  exerciseId: string,
  profileInput: ProgressionProfile
): ProgressionRepsSuggestion {
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
      nextReps: new Array(profile.sets).fill(profile.repMin),
      reason: 'Нет истории по этому профилю. Начни с нижней границы диапазона.'
    }
  }

  const latest = history[0]
  const basedOnSessions = history.length
  const minReps = Math.min(...latest.reps)
  const maxReps = Math.max(...latest.reps)
  const latestReps = latest.reps.map((item) => clamp(Math.round(item), profile.repMin, profile.repMax))

  if (basedOnSessions < 2) {
    return {
      mode: 'bootstrap',
      profileKey,
      basedOnSessions,
      nextReps: latestReps,
      reason: 'Мало данных по профилю. Повтори подходы и стабилизируй технику.'
    }
  }

  const overloadRate = history.filter((item) => Math.min(...item.reps) < profile.repMin || item.rpe >= 9.5).length / basedOnSessions
  const successRate = history.filter((item) => Math.min(...item.reps) >= profile.repMax && item.rpe <= 8.5).length / basedOnSessions

  if (minReps < profile.repMin || latest.rpe >= 9.5 || overloadRate >= 0.45) {
    return {
      mode: 'decrease',
      profileKey,
      basedOnSessions,
      nextReps: latestReps.map((item) => clamp(item - 1, profile.repMin, profile.repMax)),
      reason: 'Подходы тяжёлые по RPE/повторам. Лучше немного снизить объем.'
    }
  }

  if (maxReps >= profile.repMax && latest.rpe <= 8.5 && successRate >= 0.4) {
    return {
      mode: 'increase',
      profileKey,
      basedOnSessions,
      nextReps: latestReps.map((item) => clamp(item + 1, profile.repMin, profile.repMax)),
      reason: 'Диапазон стабильно закрыт. Добавляем по 1 повтору.'
    }
  }

  return {
    mode: 'hold',
    profileKey,
    basedOnSessions,
    nextReps: latestReps,
    reason: 'Оставь текущие повторы и удерживай качество техники.'
  }
}
