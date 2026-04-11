<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  title: string
  items: number[]
  modelValue: number
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()

const appStore = useAppStore()
const { hideFilterTitles } = storeToRefs(appStore)

// Map по значению item, а не по индексу — иначе Vue cleanup для удалённого key
// перезаписывает ref нового key, если они оказались на одном индексе
const itemRefsMap = new Map<number, HTMLElement>()
const indicatorVisible = ref(false)
const indicatorStyle = ref({ left: '0px', width: '0px' })

function updateIndicator() {
  const el = itemRefsMap.get(props.modelValue) ?? null
  if (!el) {
    indicatorVisible.value = false
    return
  }
  indicatorStyle.value = {
    left: `${el.offsetLeft}px`,
    width: `${el.offsetWidth}px`,
  }
  indicatorVisible.value = true
}

// flush: 'post' — после обновления DOM Vue
// requestAnimationFrame — после layout браузера (важно когда flex-1 пересчитывает ширины)
watch(
  [() => props.modelValue, () => props.items],
  () => requestAnimationFrame(updateIndicator),
  { flush: 'post' }
)

onMounted(() => requestAnimationFrame(updateIndicator))
</script>

<template>
  <div>
    <div v-if="!hideFilterTitles" class="pb-1 text-xs">{{ title }}</div>
    <div class="relative flex rounded-full p-1 overflow-x-auto mb-2 glass scrollbar-none gap-0.5">
      <div
        class="absolute top-1 bottom-1 rounded-full bg-text/10 transition-all duration-300 ease-out pointer-events-none"
        :class="indicatorVisible ? 'opacity-100' : 'opacity-0'"
        :style="indicatorStyle"
      />
      <div
        v-for="item in items"
        :key="item"
        :ref="(el) => { el ? itemRefsMap.set(item, el as HTMLElement) : itemRefsMap.delete(item) }"
        class="relative z-10 flex-1 shrink-0 text-center py-1 rounded-full text-md cursor-pointer transition-colors"
        :class="modelValue === item ? 'text-accent font-semibold' : 'text-accent/50'"
        @click="$emit('update:modelValue', item)"
      >{{ item }}</div>
    </div>
  </div>
</template>