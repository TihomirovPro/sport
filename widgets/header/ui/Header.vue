<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { idbStorage } from '~/shared/api/storage/idb'

const route = useRoute()
const router = useRouter()
const pagesWithoutBackBtn = new Set(['index'])
const routeName = computed(() => String(route.name ?? ''))
const isShowBackBtn = computed(() => !pagesWithoutBackBtn.has(routeName.value))
const appStore = useAppStore()
const workoutStore = useWorkoutStore()
const { isOnline, pendingOperations } = useOfflineState()
const offlineStatus = computed(() => isOnline.value ? `Синхронизация: ${pendingOperations.value}` : 'Оффлайн')
const { headerTitle } = storeToRefs(appStore)
const { selectUpdateWorkout } = storeToRefs(workoutStore)

type BackToResolver = string | ((routeName: string) => string)

type BackMeta = {
  backTo?: BackToResolver
  backToExercise?: boolean
  clearSelectUpdateWorkout?: boolean
  removeStorageKeys?: string[]
}

const backMeta = computed(() => (route.meta ?? {}) as BackMeta)

function resolveBackTarget(meta: BackMeta): string {
  if (meta.backToExercise) return `/exercise/${route.params.id}`
  if (typeof meta.backTo === 'function') return meta.backTo(routeName.value)
  if (typeof meta.backTo === 'string' && meta.backTo.length) return meta.backTo
  return '/'
}

function back() {
  const meta = backMeta.value

  if (meta.clearSelectUpdateWorkout) {
    selectUpdateWorkout.value = null
  }

  for (const key of meta.removeStorageKeys ?? []) {
    idbStorage.removeItem(key)
  }

  router.push(resolveBackTarget(meta))
}

function addItem() {
  if (routeName.value === 'index') {
    router.push('/exercise/new')
    return
  }

  if (routeName.value === 'exercise-id') {
    router.push(`/exercise/${route.params.id}/workout`)
  }
}

function toSettings() {
  router.push('/settings')
}
</script>

<template>
<header
  class="
    sticky top-0 z-100
    h-16 px-2.5
    flex items-center justify-between
    backdrop-blur-md
  "
>
  <UiButtonGlass v-if="isShowBackBtn" aria-label="Назад" @click="back">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  </UiButtonGlass>
  <UiButtonGlass v-else aria-label="Настройки" @click="toSettings">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  </UiButtonGlass>

  <!-- Center: title -->
  <div class="header-title flex-1 text-center text-[17px] font-semibold tracking-[-0.2px] text-text overflow-hidden text-ellipsis whitespace-nowrap px-1">
    {{ headerTitle }}
  </div>

  <!-- Right: add -->
  <UiButtonGlass aria-label="Добавить" @click="addItem">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </UiButtonGlass>

  <!-- Offline pill — floats below bar -->
  <div
    v-if="!isOnline || pendingOperations"
    class="flex items-center justify-center gap-[5px] w-fit mt-[5px] mx-auto px-[10px] py-[3px] rounded-[20px] text-[11px] font-medium tracking-[0.1px] bg-white/55 backdrop-blur-[16px] border border-white/50 text-black/50 shadow-[0_1px_6px_rgba(0,0,0,0.06)] dark:bg-[rgba(44,44,46,0.7)] dark:border-white/8 dark:text-white/45"
  >
    <span
      class="shrink-0 size-1.5 rounded-full"
      :class="isOnline ? 'bg-[#ff9500]' : 'bg-[#ff3b30]'"
    ></span>
    {{ offlineStatus }}
  </div>
</header>
</template>
