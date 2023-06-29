<template>
  <div class="grid-layout" ref="layoutEl" :style="style">
    <slot />
    <GridItem
      v-show="isDragging"
      class="grid-placeholder"
      v-bind="placeholder"
    ></GridItem>
  </div>
</template>
<script setup lang="ts">
import { computed, provide, reactive, toRef, ref, watch } from 'vue'
import GridItem from './gridItem.vue'
import { layoutContextKey, isResizableKey, isDraggableKey, colNumKey, colWidthKey, compact, rowHeightKey, gapKey, moveElement, getAllCollisions, getLayoutItem } from './utils'
import { useResizeObserver } from '@vueuse/core'
import { Layout, EventParam, LayoutItemContext, LayoutContext, LayoutProps } from './type'

const props = withDefaults(defineProps<LayoutProps>(), {
  colNum: 12,
  rowHeight: 50,
  gap: 10,
  layout: () => [] as Layout,
  isResizable: true,
  isDraggable: true,
  verticalCompact: true,
  preventCollision: false
})
const layoutEl = ref()
const width = ref(100)
useResizeObserver(layoutEl, entries => {
  const entry = entries[0]
  width.value = entry.contentRect.width
})

const emit = defineEmits<{
  (event: 'layout-updated', layout: Layout): void,
  (event: 'update:layout', layout: Layout): void
}>()

provide(isResizableKey, toRef(props, 'isResizable'))
provide(isDraggableKey, toRef(props, 'isDraggable'))
provide(colNumKey, toRef(props, 'colNum'))
provide(rowHeightKey, toRef(props, 'rowHeight'))

let layout: Layout

watch([() => props.layout.length, () => props.layout], () => {
  layout = compact(props.layout, props.verticalCompact)
  emit('update:layout', layout)
}, {
  immediate: true
})

const gridGap = computed(() => {
  const { gap } = props
  return Array.isArray(gap) ? gap : [gap, gap]
})

provide(gapKey, gridGap)

const col = computed(() => {
  return props.colNum
})

const colW = computed(() => {
  return (width.value - (gridGap.value[1] * (col.value - 1))) / col.value
})
provide(colWidthKey, colW)

const style = computed(() => {
  const [rowGap, colGap] = gridGap.value

  return {
    gridTemplateRows: `${props.rowHeight}px`,
    gridGap: `${rowGap}px ${colGap}px`,
    gridAutoRows: `${props.rowHeight}px`,
    padding: `${rowGap}px ${colGap}px`,
    gridTemplateColumns: `repeat(${col.value}, ${colW.value}px)`
  }
})

const placeholder = reactive<{
  x: number,
  y: number,
  w: number,
  h: number,
  i: number | string
}>({
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  i: -1
})

const isDragging = ref(false)

const resizeEvent: LayoutContext['resizeEvent'] = (event: EventParam) => {
  const { eventType, i, x, y, h, w } = event
  let lt = getLayoutItem(layout, i)

  let hasCollisions = false
  if (props.preventCollision) {
    const collisions = getAllCollisions(layout, { ...lt, w, h }).filter(layoutItem => layoutItem.i !== i)
    hasCollisions = collisions.length > 0

    if (hasCollisions) {
      // adjust w && h to maximum allowed space
      let leastX = Infinity
      let leastY = Infinity
      collisions.forEach(layoutItem => {
        if (layoutItem.x > lt.x) leastX = Math.min(leastX, layoutItem.x)
        if (layoutItem.y > lt.y) leastY = Math.min(leastY, layoutItem.y)
      })
      if (Number.isFinite(leastX)) lt.w = leastX - lt.x;
      if (Number.isFinite(leastY)) lt.h = leastY - lt.y;
    }
  }

  if (!hasCollisions) {
    lt.w = w
    lt.h = h
  }

  if (eventType == 'resizestart' || eventType == 'resizemove') {
    placeholder.i = i
    placeholder.x = x
    placeholder.y = y
    placeholder.h = lt.h
    placeholder.w = lt.w
    isDragging.value = true
  } else {
    isDragging.value = false
  }

  compact(layout, props.verticalCompact)
  emit('layout-updated', layout)
  const filed = fileds.get(i)
  filed?.createStyle()
}

const fileds = new Map<number | string, LayoutItemContext>()

/*****  drag  *****/
const dragEvent: LayoutContext['dragEvent'] = (event) => {
  const { eventType, i, x, y, h, w } = event
  const lt = getLayoutItem(layout, i)

  if (eventType == 'dragmove' || eventType === 'dragstart') {
    placeholder.i = i
    placeholder.x = lt.x
    placeholder.y = lt.y
    placeholder.w = w
    placeholder.h = h
    isDragging.value = true
  } else {
    isDragging.value = false
  }

  // Move the element to the dragged location.
  moveElement(layout, lt, x, y, true, props.preventCollision)
  compact(layout, props.verticalCompact)
  emit('layout-updated', layout)
  const filed = fileds.get(i)
  filed?.createStyle()
}

const addField: LayoutContext['addField'] = (fild) => {
  fileds.set(fild.i, fild)
}

const removeField: LayoutContext['removeField'] = (fild) => {
  fileds.set(fild.i, fild)
}

const context: LayoutContext = reactive({
  addField,
  removeField,
  dragEvent,
  resizeEvent
})

provide(layoutContextKey, context)

</script>
<style scoped>
.grid-layout{
  display: grid;
  position: relative;
}
.grid-placeholder{
  z-index: 2;
  user-select: none;
  background: pink;
  transition-duration: 100ms;
}
</style>