<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { getFirebaseAuth } from '~/shared/api/firebase/client'
import packageJson from '~/package.json'
import { IDB_KEYS } from '~/shared/config/storageKeys'
import { idbStorage } from '~/shared/api/storage/idb'

definePageMeta({
  backTo: '/'
})

watchEffect(() => {
  useHead({ title: t('settings.title') })
})

const appStore = useAppStore()
const catalogStore = useCatalogStore()
const userStore = useUserStore()
const weightStore = useWeightStore()
const { hideFilterTitles } = storeToRefs(appStore)
const { rubbersColor } = storeToRefs(catalogStore)
const { activeUser } = storeToRefs(userStore)
const { lastWeight } = storeToRefs(weightStore)
const router = useRouter()
const colorMode = useColorMode()
const { t, locale, setLocale, availableLocales } = useI18n()
const baseColor = ref('rgb(var(--colorAccent))')
const showModalColor = ref(false)
const showModalRubbers = ref(false)
const appVersion = packageJson.version || 'dev'

const storedBaseColor = idbStorage.getItem(IDB_KEYS.BASE_COLOR)
if (storedBaseColor) baseColor.value = storedBaseColor

watchEffect(() => {
  appStore.headerTitle = t('settings.title')
})

onMounted(() => {
  subscribeWeights()
})

onUnmounted(() => {
  stopWeightSubscription()
})

const isDark = computed(() => colorMode.preference === 'dark')

const userInitial = computed(() => {
  const name = activeUser.value.name || activeUser.value.email
  return name ? name.charAt(0).toUpperCase() : '?'
})

const lastWeightText = computed(() => {
  if (!lastWeight.value) return t('settings.noData')
  return `${lastWeight.value.value.toFixed(1).replace('.', ',')} ${t('common.kg')}`
})

function selectColor(color: string) {
  showModalColor.value = false

  baseColor.value = color
  idbStorage.setItem(IDB_KEYS.BASE_COLOR, color)

  const html = document.querySelector('html')

  if (!html) return
  html.style.setProperty('--color-accent', color)
}

function changeTheme() {
  if (colorMode.preference === 'dark') colorMode.preference = 'light'
  else colorMode.preference = 'dark'
}

function toWeightPage() {
  void router.push('/weight')
}

function toMeasurePage() {
  void router.push('/measure')
}

function confirmSignOut() {
  if (!process.client) return
  if (!window.confirm(t('settings.signOutConfirm'))) return
  void signOutUser()
}

async function signOutUser() {
  try {
    prepareLogout()
    const auth = getFirebaseAuth()
    await signOut(auth)
    await navigateTo('/login')
  } catch (error) {
    console.error('[firebase:signOutUser]', error)
  }
}
</script>

<template>
<div class="flex flex-col gap-5 pb-6">

  <!-- Profile card -->
  <div class="flex items-center gap-3 px-1 py-3">
    <div
      class="size-14 rounded-2xl flex-center text-white text-2xl font-semibold shrink-0"
      :style="`background: ${baseColor}`"
    >{{ userInitial }}</div>
    <div class="flex flex-col gap-1 min-w-0">
      <p class="text-base font-medium truncate">{{ activeUser.name || activeUser.email || t('settings.user') }}</p>
      <div class="flex items-center gap-1">
        <div class="size-2 rounded-full bg-green"></div>
        <p class="text-sm opacity-50">{{ activeUser.status || t('settings.user') }}</p>
      </div>
    </div>
  </div>

  <!-- Section: Appearance -->
  <div class="flex flex-col gap-1">
    <p class="text-xs font-semibold uppercase opacity-40 px-1 pb-1">{{ t('settings.appearance') }}</p>
    <div class="flex flex-col rounded-xl overflow-hidden border border-faint">

      <!-- Theme -->
      <UiSettingsItem :label="t('settings.darkTheme')" @click="changeTheme">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </template>
        <UiToggle :modelValue="isDark" :activeColor="baseColor" @update:modelValue="changeTheme" />
      </UiSettingsItem>

      <div class="h-px bg-faint mx-4"></div>

      <!-- Accent color -->
      <UiSettingsItem :label="t('settings.accentColor')" @click="showModalColor = true">
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
          <div class="size-6 rounded-full shadow-sm border border-white border-opacity-30" :style="`background: ${baseColor}`"></div>
          <svg class="opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </UiSettingsItem>
    </div>
  </div>

  <!-- Section: Workouts -->
  <div class="flex flex-col gap-1">
    <p class="text-xs font-semibold uppercase opacity-40 px-1 pb-1">{{ t('settings.workouts') }}</p>
    <div class="flex flex-col rounded-xl overflow-hidden border border-faint">

      <!-- Hide filter titles -->
      <UiSettingsItem :label="t('settings.hideFilterTitles')" @click="hideFilterTitles = !hideFilterTitles">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </template>
        <UiToggle v-model="hideFilterTitles" :activeColor="baseColor" />
      </UiSettingsItem>

      <div class="h-px bg-faint mx-4"></div>

      <!-- Rubbers -->
      <UiSettingsItem :label="t('settings.rubbers')" @click="showModalRubbers = true">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </template>
        <div class="flex items-center gap-2">
          <span class="text-sm opacity-50">{{ rubbersColor.length }} {{ t('common.pieces') }}</span>
          <svg class="opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </UiSettingsItem>
    </div>
  </div>

  <!-- Section: Profile -->
  <div class="flex flex-col gap-1">
    <p class="text-xs font-semibold uppercase opacity-40 px-1 pb-1">{{ t('settings.profile') }}</p>
    <div class="flex flex-col rounded-xl overflow-hidden border border-faint">

      <!-- Weight -->
      <UiSettingsItem :label="t('settings.myWeight')" @click="toWeightPage">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </template>
        <div class="flex items-center gap-2">
          <span class="text-sm opacity-50">{{ lastWeightText }}</span>
          <svg class="opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </UiSettingsItem>

      <div class="h-px bg-faint mx-4"></div>

      <!-- Body measurements -->
      <UiSettingsItem :label="t('settings.bodyMeasurements')" @click="toMeasurePage">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12h20" />
            <path d="M2 12l4-4" />
            <path d="M2 12l4 4" />
            <path d="M22 12l-4-4" />
            <path d="M22 12l-4 4" />
            <line x1="12" y1="8" x2="12" y2="16" />
          </svg>
        </template>
        <svg class="opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </UiSettingsItem>
    </div>
  </div>

  <!-- Section: Language -->
  <div class="flex flex-col gap-1">
    <p class="text-xs font-semibold uppercase opacity-40 px-1 pb-1">{{ t('settings.language') }}</p>
    <div class="flex flex-col rounded-xl overflow-hidden border border-faint">
      <template v-for="(lang, idx) in availableLocales" :key="lang.code">
        <div v-if="idx > 0" class="h-px bg-faint mx-4"></div>
        <button
          type="button"
          class="flex items-center justify-between px-4 py-3 w-full text-left transition-opacity active:opacity-60"
          @click="setLocale(lang.code)"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl leading-none">{{ lang.flag }}</span>
            <span class="text-sm font-medium">{{ lang.name }}</span>
          </div>
          <svg
            v-if="locale.locale === lang.code"
            class="text-accent"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </template>
    </div>
  </div>

  <!-- Sign out -->
  <button
    class="w-full py-3 rounded-xl text-sm font-medium border border-error text-error transition-opacity active:opacity-60"
    @click="confirmSignOut"
  >{{ t('settings.signOut') }}</button>

  <!-- Version -->
  <p class="text-center text-xs opacity-30">{{ t('settings.version') }} {{ appVersion }}</p>

  <UiModalColor
    :isShow="showModalColor"
    :activeColor="baseColor"
    @hiden="showModalColor = false"
    @selectColor="selectColor"
  />
  <ModalRubbers
    :isShow="showModalRubbers"
    @hiden="showModalRubbers = false"
  />
</div>
</template>
