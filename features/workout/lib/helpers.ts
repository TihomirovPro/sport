export function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function normalizeWorkoutDate(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return Date.now()
}

export function toDateInputValue(value: unknown): string {
  const timestamp = normalizeWorkoutDate(value)
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatWorkoutDate(date: number | string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date)).slice(0, -3)
}

export function parseDurationToSeconds(value: string): number {
  const raw = value.trim()
  if (!raw) return 0

  if (raw.includes(':')) {
    const [minsRaw, secsRaw] = raw.split(':')
    const mins = Number(minsRaw)
    const secs = Number(secsRaw)

    if (!Number.isFinite(mins) || !Number.isFinite(secs) || mins < 0 || secs < 0 || secs > 59) {
      return NaN
    }

    return mins * 60 + secs
  }

  const onlySeconds = Number(raw.replace(',', '.'))
  if (!Number.isFinite(onlySeconds) || onlySeconds < 0) return NaN
  return Math.floor(onlySeconds)
}

export function parseIntervalMinutes(value: unknown): number {
  const normalized = String(value ?? '').replace(',', '.').trim()
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed * 10) / 10
}

export function normalizeRpe(value: unknown): number | undefined {
  const normalized = String(value ?? '').replace(',', '.').trim()
  if (!normalized) return undefined

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return undefined

  return Math.round(parsed * 10) / 10
}

export function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []

  return value.map((item) => {
    const normalized = String(item ?? '').replace(',', '.').trim()
    return normalized === '' ? NaN : Number(normalized)
  })
}
