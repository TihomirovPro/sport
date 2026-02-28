export interface ProgressionProfile {
  sets: number
  intervalMinutes: number
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
export type SuggestionConfidence = 'low' | 'medium' | 'high'

export interface ProgressionSuggestion {
  mode: SuggestionMode
  profileKey: string
  basedOnSessions: number
  adaptiveWindow: number
  adaptiveIncrementKg: number
  adaptiveState: 'conservative' | 'neutral' | 'aggressive'
  nextWeights: number[]
  nextReps: number[]
  targetReps: number
  reason: string
  confidenceLevel: SuggestionConfidence
  confidenceScore: number
  validationDroppedSessions: number
}

export interface ProgressionRepsSuggestion {
  mode: SuggestionMode
  profileKey: string
  basedOnSessions: number
  nextReps: number[]
  reason: string
  confidenceLevel: SuggestionConfidence
  confidenceScore: number
  validationDroppedSessions: number
}

const MIN_VALID_DATE_TS = Date.UTC(2000, 0, 1)
const MAX_FUTURE_DRIFT_MS = 7 * 24 * 60 * 60 * 1000
const MAX_REASONABLE_SETS = 30
const MAX_REASONABLE_REPS = 300
const MAX_REASONABLE_WEIGHT = 2000

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

function roundToIncrement(value: number, increment: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (!Number.isFinite(increment) || increment <= 0) return Math.round(value * 100) / 100
  const rounded = Math.round(value / increment) * increment
  return Math.round(rounded * 100) / 100
}

function roundToIncrementDown(value: number, increment: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (!Number.isFinite(increment) || increment <= 0) return Math.round(value * 100) / 100
  const rounded = Math.floor(value / increment) * increment
  return Math.round(rounded * 100) / 100
}

function roundToIncrementUp(value: number, increment: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (!Number.isFinite(increment) || increment <= 0) return Math.round(value * 100) / 100
  const rounded = Math.ceil(value / increment) * increment
  return Math.round(rounded * 100) / 100
}

function roundToHalfStep(value: number): number {
  return Math.round(value * 2) / 2
}

function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2
  return sorted[middle]
}

function isValidSessionMeta(session: ProgressionSession): boolean {
  const date = Number(session.date)
  if (!Number.isFinite(date)) return false
  if (date < MIN_VALID_DATE_TS) return false
  if (date > Date.now() + MAX_FUTURE_DRIFT_MS) return false

  if (!String(session.id || '').trim()) return false
  if (!String(session.exerciseId || '').trim()) return false
  if (!String(session.profileKey || '').trim()) return false

  return true
}

function computeIntervalLoadPenalty(intervalMinutes: number): number {
  if (intervalMinutes <= 0) return 0.45
  if (intervalMinutes <= 1) return 0.35
  if (intervalMinutes <= 1.5) return 0.2
  if (intervalMinutes < 2) return 0.1
  return 0
}

function toConfidenceLevel(score: number): SuggestionConfidence {
  if (score >= 0.75) return 'high'
  if (score >= 0.5) return 'medium'
  return 'low'
}

function computeConfidenceScore(
  validSessions: number,
  totalProfileSessions: number,
  intervalMinutes: number,
  latestRpe: number | null,
  mode: SuggestionMode
): { score: number, level: SuggestionConfidence } {
  const droppedSessions = Math.max(0, totalProfileSessions - validSessions)
  const droppedRate = totalProfileSessions > 0 ? droppedSessions / totalProfileSessions : 0
  const intervalPenalty = computeIntervalLoadPenalty(intervalMinutes)

  let score = 0.45
  score += Math.min(validSessions, 8) * 0.05
  score -= droppedRate * 0.25
  score -= intervalPenalty * 0.15

  if (latestRpe !== null && latestRpe >= 9.5) score -= 0.1
  if (mode === 'bootstrap') score = Math.min(score, 0.55)

  const normalizedScore = clamp(Math.round(score * 100) / 100, 0.2, 0.98)
  return {
    score: normalizedScore,
    level: toConfidenceLevel(normalizedScore)
  }
}

function hasHighRepVariability(reps: number[]): boolean {
  if (!Array.isArray(reps) || reps.length < 3) return false
  const normalized = reps
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0)
  if (normalized.length < 3) return false

  const min = Math.min(...normalized)
  const max = Math.max(...normalized)
  const spread = max - min
  const avg = normalized.reduce((sum, value) => sum + value, 0) / normalized.length
  const relativeSpread = avg > 0 ? spread / avg : 0

  return spread >= 3 || relativeSpread >= 0.35
}

function sanitizeForAutoIncrement(session: ProgressionSession): ProgressionSession | null {
  if (!isValidSessionMeta(session)) return null
  if (!Array.isArray(session.weights) || !session.weights.length) return null
  if (session.weights.length > MAX_REASONABLE_SETS) return null
  const weights = session.weights.map((item) => Number(item))
  const hasInvalidWeights = weights.some((item) => !Number.isFinite(item) || item < 0 || item > MAX_REASONABLE_WEIGHT)
  if (hasInvalidWeights) return null
  return {
    ...session,
    weights
  }
}

function computeAutoBaseIncrement(history: ProgressionSession[]): number {
  if (!history.length) return 1

  const normalized = history
    .map((session) => sanitizeForAutoIncrement(session))
    .filter((session): session is ProgressionSession => Boolean(session))
    .sort((a, b) => a.date - b.date)

  if (!normalized.length) return 1

  const sessionAverages = normalized
    .map((session) => session.weights.reduce((sum, weight) => sum + weight, 0) / session.weights.length)
    .filter((value) => Number.isFinite(value) && value > 0)

  if (!sessionAverages.length) return 1

  const deltas: number[] = []
  for (let index = 1; index < sessionAverages.length; index += 1) {
    const delta = Math.abs(sessionAverages[index] - sessionAverages[index - 1])
    if (delta > 0) deltas.push(delta)
  }

  const base = deltas.length
    ? median(deltas)
    : sessionAverages[sessionAverages.length - 1] * 0.025

  return clamp(roundToHalfStep(base), 0.5, 5)
}

function sanitizeForAutoRepRange(session: ProgressionSession): ProgressionSession | null {
  if (!isValidSessionMeta(session)) return null
  if (!Array.isArray(session.reps) || !session.reps.length) return null
  if (session.reps.length > MAX_REASONABLE_SETS) return null
  const reps = session.reps.map((item) => Number(item))
  const hasInvalidReps = reps.some((item) => !Number.isFinite(item) || item <= 0 || item > MAX_REASONABLE_REPS)
  if (hasInvalidReps) return null
  return {
    ...session,
    reps
  }
}

function computeAutoRepRange(history: ProgressionSession[]): { repMin: number, repMax: number } {
  const fallback = { repMin: 6, repMax: 8 }
  if (!history.length) return fallback

  const normalized = history
    .map((session) => sanitizeForAutoRepRange(session))
    .filter((session): session is ProgressionSession => Boolean(session))
    .sort((a, b) => b.date - a.date)

  if (!normalized.length) return fallback

  const minRepsHistory = normalized.map((session) => Math.min(...session.reps))
  const maxRepsHistory = normalized.map((session) => Math.max(...session.reps))
  const latestMin = minRepsHistory[0]
  const latestMax = maxRepsHistory[0]

  const rawMin = normalized.length < 3 ? latestMin : median(minRepsHistory)
  const rawMax = normalized.length < 3 ? latestMax : median(maxRepsHistory)

  const repMin = clamp(Math.round(rawMin), 1, 99)
  let repMax = clamp(Math.round(rawMax), repMin + 1, 100)

  if (repMax - repMin < 1) repMax = Math.min(100, repMin + 1)
  if (repMax - repMin > 6) repMax = repMin + 6

  return { repMin, repMax }
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
      incrementKg: clamp(roundToHalfStep(baseIncrement * 0.5), 0.5, 5),
      state: 'conservative'
    }
  }

  if (successRate >= 0.55 && overloadRate <= 0.15 && avgRpe <= 8.2) {
    return {
      incrementKg: clamp(roundToHalfStep(baseIncrement * 1.5), 0.5, 5),
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

  return { sets, intervalMinutes }
}

function sanitizeSession(session: ProgressionSession, expectedSets: number): ProgressionSession | null {
  if (!isValidSessionMeta(session)) return null
  if (expectedSets < 1 || expectedSets > MAX_REASONABLE_SETS) return null
  if (!Array.isArray(session.reps) || !Array.isArray(session.weights)) return null
  if (session.reps.length !== expectedSets || session.weights.length !== expectedSets) return null

  const reps = session.reps.map((item) => Number(item))
  const weights = session.weights.map((item) => Number(item))
  const hasInvalidReps = reps.some((item) => !Number.isFinite(item) || item <= 0 || item > MAX_REASONABLE_REPS)
  const hasInvalidWeights = weights.some((item) => !Number.isFinite(item) || item < 0 || item > MAX_REASONABLE_WEIGHT)
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
  const exerciseHistory = sessions.filter((session) => session.exerciseId === exerciseId)
  const autoBaseIncrementKg = computeAutoBaseIncrement(exerciseHistory)
  const autoRepRange = computeAutoRepRange(exerciseHistory)
  const repMin = autoRepRange.repMin
  const repMax = autoRepRange.repMax

  const profileSessions = exerciseHistory.filter((session) => session.profileKey === profileKey)
  const history = profileSessions
    .map((session) => sanitizeSession(session, profile.sets))
    .filter((session): session is ProgressionSession => Boolean(session))
    .sort((a, b) => b.date - a.date)
  const validationDroppedSessions = Math.max(0, profileSessions.length - history.length)
  const intervalLoadPenalty = computeIntervalLoadPenalty(profile.intervalMinutes)

  if (!history.length) {
    const confidence = computeConfidenceScore(0, profileSessions.length, profile.intervalMinutes, null, 'bootstrap')
    return {
      mode: 'bootstrap',
      profileKey,
      basedOnSessions: 0,
      adaptiveWindow: 0,
      adaptiveIncrementKg: autoBaseIncrementKg,
      adaptiveState: 'neutral',
      nextWeights: new Array(profile.sets).fill(0),
      nextReps: new Array(profile.sets).fill(repMin),
      targetReps: repMin,
      reason: 'Нет истории по этому профилю. Начни с комфортного стартового веса.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  const latest = history[0]
  const minReps = Math.min(...latest.reps)
  const latestReps = latest.reps.map((item) => clamp(Math.round(item), 1, 100))
  const latestWeights = latest.weights.map((item) => roundToIncrement(item, autoBaseIncrementKg))
  const baseTargetReps = clamp(minReps, repMin, repMax)
  const basedOnSessions = history.length
  const latestAdjustedRpe = clamp(latest.rpe + intervalLoadPenalty, 1, 10)
  const highVariability = hasHighRepVariability(latest.reps)

  if (history.length < 2) {
    const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'bootstrap')
    return {
      mode: 'bootstrap',
      profileKey,
      basedOnSessions,
      adaptiveWindow: basedOnSessions,
      adaptiveIncrementKg: autoBaseIncrementKg,
      adaptiveState: 'neutral',
      nextWeights: latestWeights,
      nextReps: latestReps,
      targetReps: baseTargetReps,
      reason: 'Мало данных по профилю. Повтори вес и стабилизируй технику.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  const perSession = history.map((item) => {
    const sessionMinReps = Math.min(...item.reps)
    const adjustedRpe = clamp(item.rpe + intervalLoadPenalty, 1, 10)
    return {
      minReps: sessionMinReps,
      success: sessionMinReps >= repMax && adjustedRpe <= 8,
      overload: sessionMinReps < repMin || adjustedRpe >= 9.5,
      adjustedRpe
    }
  })

  const successCount = perSession.filter((item) => item.success).length
  const overloadCount = perSession.filter((item) => item.overload).length
  const successRate = successCount / basedOnSessions
  const overloadRate = overloadCount / basedOnSessions
  const avgRpe = perSession.reduce((sum, item) => sum + item.adjustedRpe, 0) / basedOnSessions
  const adaptive = computeAdaptiveIncrement(autoBaseIncrementKg, successRate, overloadRate, avgRpe, basedOnSessions)
  const stepKg = adaptive.incrementKg
  const stagnation = overloadRate >= 0.5 && avgRpe >= 9

  if (stagnation || minReps < repMin || latestAdjustedRpe >= 9.5) {
    const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'decrease')
    return {
      mode: 'decrease',
      profileKey,
      basedOnSessions,
      adaptiveWindow: basedOnSessions,
      adaptiveIncrementKg: stepKg,
      adaptiveState: adaptive.state,
      nextWeights: latestWeights.map((weight) => roundToIncrementDown(weight - stepKg, autoBaseIncrementKg)),
      nextReps: new Array(profile.sets).fill(repMin),
      targetReps: repMin,
      reason: stagnation
        ? 'По истории много перегруза. Рекомендуется шаг назад.'
        : 'Высокий RPE или недобор повторов. Лучше снизить вес.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  if (minReps >= repMax && latestAdjustedRpe <= 8 && successRate >= 0.4) {
    if (highVariability) {
      const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'hold')
      return {
        mode: 'hold',
        profileKey,
        basedOnSessions,
        adaptiveWindow: basedOnSessions,
        adaptiveIncrementKg: stepKg,
        adaptiveState: adaptive.state,
        nextWeights: latestWeights,
        nextReps: latestReps,
        targetReps: minReps,
        reason: 'Разброс по подходам высокий. Сначала стабилизируй повторы, затем повышай нагрузку.',
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score,
        validationDroppedSessions
      }
    }

    const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'increase')
    return {
      mode: 'increase',
      profileKey,
      basedOnSessions,
      adaptiveWindow: basedOnSessions,
      adaptiveIncrementKg: stepKg,
      adaptiveState: adaptive.state,
      nextWeights: latestWeights.map((weight) => roundToIncrementUp(weight + stepKg, autoBaseIncrementKg)),
      nextReps: new Array(profile.sets).fill(repMin),
      targetReps: repMin,
      reason: 'Верх диапазона достигнут при комфортном RPE. Можно добавить вес.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'hold')
  return {
    mode: 'hold',
    profileKey,
    basedOnSessions,
    adaptiveWindow: basedOnSessions,
    adaptiveIncrementKg: stepKg,
    adaptiveState: adaptive.state,
    nextWeights: latestWeights,
    nextReps: latestReps,
    targetReps: minReps,
    reason: 'Оставь текущие повторы и удерживай качество техники.',
    confidenceLevel: confidence.level,
    confidenceScore: confidence.score,
    validationDroppedSessions
  }
}

export function computeBodyweightRepsSuggestion(
  sessions: ProgressionSession[],
  exerciseId: string,
  profileInput: ProgressionProfile
): ProgressionRepsSuggestion {
  const profile = normalizeProfile(profileInput)
  const profileKey = buildProfileKey(profile)
  const exerciseHistory = sessions.filter((session) => session.exerciseId === exerciseId)
  const autoRepRange = computeAutoRepRange(exerciseHistory)
  const repMin = autoRepRange.repMin
  const repMax = autoRepRange.repMax

  const profileSessions = exerciseHistory.filter((session) => session.profileKey === profileKey)
  const history = profileSessions
    .map((session) => sanitizeSession(session, profile.sets))
    .filter((session): session is ProgressionSession => Boolean(session))
    .sort((a, b) => b.date - a.date)
  const validationDroppedSessions = Math.max(0, profileSessions.length - history.length)
  const intervalLoadPenalty = computeIntervalLoadPenalty(profile.intervalMinutes)

  if (!history.length) {
    const confidence = computeConfidenceScore(0, profileSessions.length, profile.intervalMinutes, null, 'bootstrap')
    return {
      mode: 'bootstrap',
      profileKey,
      basedOnSessions: 0,
      nextReps: new Array(profile.sets).fill(repMin),
      reason: 'Нет истории по этому профилю. Начни с нижней границы диапазона.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  const latest = history[0]
  const basedOnSessions = history.length
  const minReps = Math.min(...latest.reps)
  const maxReps = Math.max(...latest.reps)
  const latestReps = latest.reps.map((item) => clamp(Math.round(item), 1, 100))
  const latestAdjustedRpe = clamp(latest.rpe + intervalLoadPenalty, 1, 10)
  const highVariability = hasHighRepVariability(latest.reps)

  if (basedOnSessions < 2) {
    const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'bootstrap')
    return {
      mode: 'bootstrap',
      profileKey,
      basedOnSessions,
      nextReps: latestReps,
      reason: 'Мало данных по профилю. Повтори подходы и стабилизируй технику.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  const overloadRate = history.filter((item) => Math.min(...item.reps) < repMin || clamp(item.rpe + intervalLoadPenalty, 1, 10) >= 9.5).length / basedOnSessions
  const successRate = history.filter((item) => Math.min(...item.reps) >= repMax && clamp(item.rpe + intervalLoadPenalty, 1, 10) <= 8.5).length / basedOnSessions

  if (minReps < repMin || latestAdjustedRpe >= 9.5 || overloadRate >= 0.45) {
    const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'decrease')
    return {
      mode: 'decrease',
      profileKey,
      basedOnSessions,
      nextReps: latestReps.map((item) => clamp(item - 1, 1, 100)),
      reason: 'Подходы тяжёлые по RPE/повторам. Лучше немного снизить объем.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  if (maxReps >= repMax && latestAdjustedRpe <= 8.5 && successRate >= 0.4) {
    if (highVariability) {
      const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'hold')
      return {
        mode: 'hold',
        profileKey,
        basedOnSessions,
        nextReps: latestReps,
        reason: 'Разброс по подходам высокий. Сначала стабилизируй повторы, затем повышай объем.',
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score,
        validationDroppedSessions
      }
    }

    const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'increase')
    return {
      mode: 'increase',
      profileKey,
      basedOnSessions,
      nextReps: latestReps.map((item) => clamp(item + 1, 1, 100)),
      reason: 'Диапазон стабильно закрыт. Добавляем по 1 повтору.',
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      validationDroppedSessions
    }
  }

  const confidence = computeConfidenceScore(basedOnSessions, profileSessions.length, profile.intervalMinutes, latestAdjustedRpe, 'hold')
  return {
    mode: 'hold',
    profileKey,
    basedOnSessions,
    nextReps: latestReps,
    reason: 'Оставь текущие повторы и удерживай качество техники.',
    confidenceLevel: confidence.level,
    confidenceScore: confidence.score,
    validationDroppedSessions
  }
}
