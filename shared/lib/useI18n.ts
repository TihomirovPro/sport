import { reactive, readonly } from 'vue'
import ru from '~/shared/config/locales/ru'
import en from '~/shared/config/locales/en'
import es from '~/shared/config/locales/es'
import { EnumEase } from '~/shared/config/enums'

export type LocaleCode = 'ru' | 'en' | 'es'

const STORAGE_KEY = 'app-locale'

type LocaleDict = Record<string, Record<string, string>>

const locales: Record<LocaleCode, LocaleDict> = {
  ru: ru as unknown as LocaleDict,
  en: en as unknown as LocaleDict,
  es: es as unknown as LocaleDict,
}

const state = reactive({ locale: 'ru' as LocaleCode })

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null
  if (saved && saved in locales) state.locale = saved
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : path
}

function t(key: string, params?: Record<string, string | number>): string {
  const value = getNestedValue(locales[state.locale] as unknown as Record<string, unknown>, key)
  if (!params) return value
  return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
}

function setLocale(code: LocaleCode) {
  state.locale = code
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, code)
  }
}

const easeKeyMap: Record<string, string> = {
  [EnumEase.noWeight]: 'ease.noWeight',
  [EnumEase.weight]: 'ease.weight',
  [EnumEase.rubber]: 'ease.rubber',
}

function translateEase(ease: string): string {
  return t(easeKeyMap[ease] ?? ease)
}

function getIntlLocale(): string {
  const map: Record<LocaleCode, string> = { ru: 'ru-RU', en: 'en-US', es: 'es-ES' }
  return map[state.locale]
}

export const availableLocales: { code: LocaleCode; name: string; flag: string }[] = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

export function useI18n() {
  return {
    t,
    locale: readonly(state),
    setLocale,
    availableLocales,
    translateEase,
    getIntlLocale,
  }
}
