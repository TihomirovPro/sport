<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  subscribeMeasureTypes,
  stopMeasureTypesSubscription,
  addMeasureType,
  removeMeasureType,
} from '~/composables/useMeasure'

definePageMeta({
  backTo: '/settings'
})

useHead({
  title: 'Замеры тела',
})

const appStore = useAppStore()
const measureStore = useMeasureStore()
const { types } = storeToRefs(measureStore)
const router = useRouter()
const { notifyError } = useNotifications()

appStore.headerTitle = 'Замеры тела'

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
    notifyError('Введите название замера')
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
    notifyError('Не удалось сохранить. Попробуйте снова.')
  } finally {
    isSaving.value = false
  }
}

async function onRemoveType(id: string) {
  if (!id || deletingId.value) return
  if (!window.confirm('Удалить замер и все его записи?')) return

  const prev = [...types.value]
  measureStore.setTypes(prev.filter(t => t.id !== id))

  deletingId.value = id
  try {
    await removeMeasureType(id)
  } catch (error) {
    console.error('[measure:removeType]', error)
    measureStore.setTypes(prev)
    notifyError('Не удалось удалить. Попробуйте снова.')
  } finally {
    deletingId.value = null
  }
}

function openType(type: { id: string; name: string; unit: string }) {
  measureStore.activeType = type
  void router.push('/measure-item')
}
</script>

<template lang="pug">
.grid.gap-4

  //- Add form
  .border.border-faint.rounded-xl.overflow-hidden
    button.w-full.flex.items-center.justify-between.px-4.py-3.cursor-pointer(
      type="button"
      @click="showAddForm = !showAddForm"
    )
      .flex.items-center.gap-3
        .size-8.rounded-lg.flex-center.bg-faint.opacity-80
          svg(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
            line(x1="12" y1="5" x2="12" y2="19")
            line(x1="5" y1="12" x2="19" y2="12")
        span.text-sm Добавить замер
      svg.opacity-40.transition-transform(
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        :class="showAddForm ? 'rotate-90' : ''"
      )
        polyline(points="9 18 15 12 9 6")

    .px-4.pb-4.grid.gap-3(v-if="showAddForm")
      .h-px.bg-faint.-mx-4.mb-1
      .grid.grid-cols-2.gap-2
        .grid.gap-1
          label.text-xs.text-gray-500(for="measure-name") Название
          input#measure-name.border.border-faint.p-2.rounded-lg.w-full.bg-transparent.text-sm(
            v-model="newName"
            type="text"
            placeholder="Бицепс"
            @keyup.enter="submitType"
          )
        .grid.gap-1
          label.text-xs.text-gray-500(for="measure-unit") Единица
          input#measure-unit.border.border-faint.p-2.rounded-lg.w-full.bg-transparent.text-sm(
            v-model="newUnit"
            type="text"
            placeholder="см"
            @keyup.enter="submitType"
          )
      BaseButton(
        text="Сохранить"
        :disabled="isSaving"
        @click="submitType"
      )

  //- Types list
  .border.border-faint.rounded-xl.overflow-hidden(v-if="types.length")
    .flex.items-center.justify-between.px-4(
      v-for="(type, index) in types"
      :key="type.id"
      class="py-3"
      :class="index < types.length - 1 ? 'border-b border-faint' : ''"
    )
      .flex.items-center.gap-3.flex-1.cursor-pointer.min-w-0(
        @click="openType(type)"
      )
        .size-8.rounded-lg.flex-center.bg-faint.shrink-0
          svg(width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
            line(x1="18" y1="20" x2="18" y2="10")
            line(x1="12" y1="20" x2="12" y2="4")
            line(x1="6" y1="20" x2="6" y2="14")
        .min-w-0
          p.text-sm.font-medium.truncate {{ type.name }}
          p.text-xs.text-gray-500 {{ type.unit }}
      .flex.items-center.gap-2
        button.text-xs.text-error.cursor-pointer.py-1.px-2.rounded-lg.border.border-transparent.transition-all.shrink-0(
          type="button"
          :disabled="deletingId === type.id"
          class="hover:border-error/30"
          :class="{ 'opacity-50 pointer-events-none': deletingId === type.id }"
          @click.stop="onRemoveType(type.id)"
        ) {{ deletingId === type.id ? '...' : 'Удалить' }}
        svg.opacity-40.shrink-0(
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          @click="openType(type)"
        )
          polyline(points="9 18 15 12 9 6")

  //- Empty state
  .border.border-faint.rounded-xl.p-8.grid.place-items-center.gap-2(v-else)
    p.text-2xl 📏
    p.text-sm.text-gray-500.text-center Замеры не добавлены
    p.text-xs.text-gray-500.text-center Нажмите «Добавить замер» выше
</template>
