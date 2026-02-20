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
    name: `Новая резина ${localRubbers.value.length + 1}`,
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
    notifyError('Не удалось сохранить набор резин')
  }
}

async function reset() {
  try {
    await catalogStore.resetRubbers()
    emit('hiden')
  } catch (error) {
    console.error('[firebase:resetRubbers]', error)
    notifyError('Не удалось сбросить набор резин')
  }
}
</script>

<template lang="pug">
Modal(:isShow="isShow" @hiden="emit('hiden')")
  template(#content)
    .text-sm.font-medium Набор резин
    .text-xs.opacity-70 Изменения применяются в экране тренировки

    .grid.gap-2
      .grid.gap-2.border.border-faint.rounded-lg.p-2(
        v-for="(item, index) in localRubbers"
        :key="index"
      )
        BaseInput(
          v-model="item.name"
          type="text"
          placeholder="Название"
        )
        .flex.items-center.gap-3
          input.h-10.w-16.cursor-pointer(
            :value="toHexColor(item.color)"
            type="color"
            @input="onColorInput(index, $event)"
          )
          BaseInput(
            v-model="item.color"
            type="text"
            placeholder="#3b82f6 или rgb(...)"
          )
          button.text-error.text-sm.ml-auto(
            type="button"
            @click="removeRubber(index)"
          ) Удалить

      button.border.border-faint.rounded-lg.py-2(
        type="button"
        @click="addRubber"
      ) + Добавить резину

  template(#bottom)
    BaseButton(
      red
      text="Сбросить"
      @click="reset"
    )
    BaseButton(
      text="Сохранить"
      @click="save"
    )
</template>
