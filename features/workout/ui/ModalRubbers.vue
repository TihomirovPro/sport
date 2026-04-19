<script setup lang="ts">
import { storeToRefs } from 'pinia'

defineProps<{
  isShow: boolean
}>()

const emit = defineEmits<{
  hiden: []
}>()

type RubberItem = {
  name: string
  color: string
}

const { t } = useI18n()
const catalogStore = useCatalogStore()
const { rubbersColor } = storeToRefs(catalogStore)
const { notifyError } = useNotifications()

const localRubbers = ref<RubberItem[]>([])

watch(
  () => rubbersColor.value,
  (items) => {
    localRubbers.value = items.map((item) => ({ ...item }))
  },
  { immediate: true, deep: true }
)

function addRubber() {
  localRubbers.value.push({
    name: t('rubbers.newName', { index: localRubbers.value.length + 1 }),
    color: '#3b82f6',
  })
}

function removeRubber(index: number) {
  localRubbers.value.splice(index, 1)
}

function toHexColor(value: string): string {
  const normalized = value.trim()
  if (/^#[\da-fA-F]{6}$/.test(normalized)) return normalized

  const rgbMatch = normalized.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (!rgbMatch) return '#3b82f6'

  const [rRaw, gRaw, bRaw] = [rgbMatch[1], rgbMatch[2], rgbMatch[3]]
  const channels = [rRaw, gRaw, bRaw].map((item) => {
    const number = Number(item)
    const safe = Math.max(0, Math.min(255, Number.isFinite(number) ? number : 0))
    return safe.toString(16).padStart(2, '0')
  })

  return `#${channels.join('')}`
}

function updateColorFromPicker(index: number, value: string) {
  const item = localRubbers.value[index]
  if (!item) return
  item.color = value
}

function onColorInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target) return
  updateColorFromPicker(index, target.value)
}

async function save() {
  const prepared = localRubbers.value
    .map((item) => ({
      name: item.name.trim(),
      color: item.color.trim(),
    }))
    .filter((item) => item.name && item.color)

  try {
    await catalogStore.saveRubbers(prepared)
    emit('hiden')
  } catch (error) {
    console.error('[firebase:saveRubbers]', error)
    notifyError(t('rubbers.errorSaveFailed'))
  }
}

async function reset() {
  try {
    await catalogStore.resetRubbers()
    emit('hiden')
  } catch (error) {
    console.error('[firebase:resetRubbers]', error)
    notifyError(t('rubbers.errorResetFailed'))
  }
}
</script>

<template>
<UiModal :isShow="isShow" @hiden="emit('hiden')">
  <template #content>
    <div class="flex items-start justify-between">
      <div>
        <div class="text-base font-semibold">{{ t('rubbers.title') }}</div>
        <div class="text-xs opacity-50 mt-0.5">{{ t('rubbers.subtitle') }}</div>
      </div>
      <div class="text-xs opacity-40 font-medium tabular-nums pt-0.5">{{ localRubbers.length }} {{ t('common.pieces') }}</div>
    </div>

    <div class="grid gap-2">
      <TransitionGroup name="rubber-list">
        <div
          v-for="(item, index) in localRubbers"
          :key="index"
          class="relative rounded-xl border border-faint overflow-hidden"
        >
          <div class="flex items-center gap-0">
            <label
              class="relative cursor-pointer shrink-0 self-stretch flex items-center justify-center w-14"
              :style="`background: ${toHexColor(item.color)}18`"
              :title="t('rubbers.colorSelect')"
            >
              <div
                class="size-8 rounded-full shadow-md transition-transform hover:scale-105"
                :style="`background: ${toHexColor(item.color)}`"
              ></div>
              <input
                :value="toHexColor(item.color)"
                type="color"
                class="absolute inset-0 opacity-0 cursor-pointer size-full"
                @input="onColorInput(index, $event)"
              />
            </label>
            <div class="flex-1 flex flex-col gap-1 py-2 px-3">
              <input
                v-model="item.name"
                type="text"
                :placeholder="t('rubbers.namePlaceholder')"
                class="bg-transparent text-sm font-medium w-full outline-none placeholder-opacity-40 border-b border-faint/60 pb-1 focus:border-accent transition-colors"
              />
              <input
                v-model="item.color"
                type="text"
                placeholder="#3b82f6"
                class="bg-transparent text-xs opacity-50 w-full outline-none font-mono focus:opacity-80 transition-opacity"
              />
            </div>
            <button
              class="shrink-0 self-stretch flex items-center justify-center transition-colors w-10 text-error/40 hover:text-error hover:bg-error/8"
              type="button"
              @click="removeRubber(index)"
            >
              <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>

      <button
        class="flex items-center justify-center gap-2 rounded-xl border border-dashed border-faint py-3 w-full transition-colors text-sm opacity-60 hover:opacity-100 hover:border-accent hover:text-accent"
        type="button"
        @click="addRubber"
      >
        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>{{ t('rubbers.add') }}</span>
      </button>
    </div>
  </template>

  <template #bottom>
    <UiButton red :text="t('rubbers.reset')" @click="reset" />
    <UiButton :text="t('common.save')" @click="save" />
  </template>
</UiModal>
</template>

<style scoped>
.rubber-list-enter-active,
.rubber-list-leave-active {
  transition: all 0.2s ease;
}
.rubber-list-enter-from,
.rubber-list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
