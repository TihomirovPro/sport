<script setup lang="ts">
import { storeToRefs } from 'pinia'
definePageMeta({
  backTo: '/settings'
})

const appStore = useAppStore()
const measureStore = useMeasureStore()
const { types } = storeToRefs(measureStore)
const router = useRouter()
const { notifyError } = useNotifications()
const { t } = useI18n()

watchEffect(() => {
  useHead({ title: t('measure.title') })
  appStore.headerTitle = t('measure.title')
})

const showAddForm = ref(false)
const newName = ref('')
const newUnit = ref('см')
const isSaving = ref(false)
const deletingId = ref<string | null>(null)

onMounted(() => {
  subscribeMeasureTypes()
})

onUnmounted(() => {
  stopMeasureTypesSubscription()
})

async function submitType() {
  if (isSaving.value) return
  if (!newName.value.trim()) {
    notifyError(t('measure.errorNoName'))
    return
  }

  isSaving.value = true
  try {
    await addMeasureType(newName.value, newUnit.value || 'см')
    newName.value = ''
    newUnit.value = 'см'
    showAddForm.value = false
  } catch (error) {
    console.error('[measure:submitType]', error)
    notifyError(t('measure.errorSaveFailed'))
  } finally {
    isSaving.value = false
  }
}

async function onRemoveType(id: string) {
  if (!id || deletingId.value) return
  if (!window.confirm(t('measure.deleteConfirm'))) return

  const prev = [...types.value]
  measureStore.setTypes(prev.filter(t => t.id !== id))

  deletingId.value = id
  try {
    await removeMeasureType(id)
  } catch (error) {
    console.error('[measure:removeType]', error)
    measureStore.setTypes(prev)
    notifyError(t('measure.errorDeleteFailed'))
  } finally {
    deletingId.value = null
  }
}

function openType(type: { id: string; name: string; unit: string }) {
  measureStore.activeType = type
  void router.push('/measure-item')
}
</script>

<template>
<div class="grid gap-4">

  <!-- Add form -->
  <div class="border border-faint rounded-xl overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      @click="showAddForm = !showAddForm"
    >
      <div class="flex items-center gap-3">
        <div class="size-8 rounded-lg flex-center bg-faint opacity-80">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span class="text-sm">{{ t('measure.add') }}</span>
      </div>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="opacity-40 transition-transform"
        :class="showAddForm ? 'rotate-90' : ''"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <div v-if="showAddForm" class="px-4 pb-4 grid gap-3">
      <div class="h-px bg-faint -mx-4 mb-1"></div>
      <div class="grid grid-cols-2 gap-2">
        <div class="grid gap-1">
          <label class="text-xs text-gray-500" for="measure-name">{{ t('measure.name') }}</label>
          <UiInput
            id="measure-name"
            v-model="newName"
            type="text"
            :placeholder="t('measure.namePlaceholder')"
            @keyup.enter="submitType"
          />
        </div>
        <div class="grid gap-1">
          <label class="text-xs text-gray-500" for="measure-unit">{{ t('measure.unit') }}</label>
          <UiInput
            id="measure-unit"
            v-model="newUnit"
            type="text"
            :placeholder="t('measure.unitPlaceholder')"
            @keyup.enter="submitType"
          />
        </div>
      </div>
      <UiButton :text="t('common.save')" :disabled="isSaving" @click="submitType" />
    </div>
  </div>

  <!-- Types list -->
  <div class="border border-faint rounded-xl overflow-hidden" v-if="types.length">
    <div
      v-for="(type, index) in types"
      :key="type.id"
      class="flex items-center justify-between px-4 py-3"
      :class="index < types.length - 1 ? 'border-b border-faint' : ''"
    >
      <div class="flex items-center gap-3 flex-1 cursor-pointer min-w-0" @click="openType(type)">
        <div class="size-8 rounded-lg flex-center bg-faint shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">{{ type.name }}</p>
          <p class="text-xs text-gray-500">{{ type.unit }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="text-xs text-error cursor-pointer py-1 px-2 rounded-lg border border-transparent transition-all shrink-0 hover:border-error/30"
          :disabled="deletingId === type.id"
          :class="{ 'opacity-50 pointer-events-none': deletingId === type.id }"
          @click.stop="onRemoveType(type.id)"
        >{{ deletingId === type.id ? t('measure.deleting') : t('common.delete') }}</button>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="opacity-40 shrink-0"
          @click="openType(type)"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <UiEmptyState v-else icon="📏" :title="t('measure.empty')" :hint="t('measure.emptyHint')" />
</div>
</template>
