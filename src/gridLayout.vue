<template>
  <div class="grid-layout" ref="layoutEl" :style="style">
    <slot />
    <GridItem v-show="isDragging" class="grid-placeholder" v-bind="placeholder"></GridItem>
  </div>
</template>
<script setup lang="ts">
import { computed, provide, reactive, toRef, ref, watch } from 'vue'

import GridItem from './gridItem.vue'
import { layoutContextKey, isResizableKey, isDraggableKey, colNumKey, colWidthKey, compact, rowHeightKey, gapKey, moveElement, getAllCollisions, getLayoutItem, stepKey } from './utils'
import { useResizeObserver } from '@vueuse/core'
import { Layout, EventParam, LayoutItemContext, LayoutContext, LayoutProps, RequiredProps } from './type'
import { useResponsive } from './useResponsive'

const props = withDefaults(defineProps<LayoutProps>(), {
  colNum: 12,
  rowHeight: 50,
  gap: 10,
  layout: () => [] as Layout,
  isResizable: true,
  isDraggable: true,
  verticalCompact: true,
  preventCollision: false,
  responsive: false,
  breakpoints: () => ({ xxs: 0, xs: 480, sm: 768, md: 992, lg: 1200, xl: 1920 })
})

const breakpoint = useResponsive(props.breakpoints, props.responsiveLayouts || {})

const layoutEl = ref()
const width = ref(100)
useResizeObserver(layoutEl, entries => {
  const entry = entries[0]
  width.value = entry.contentRect.width
})

const emit = defineEmits<{
  (event: 'layout-updated', layout: Layout): void,
  (event: 'update:layout', layout: Layout): void,
  (event: 'breakpoint-changed', breakpoints: string[], layout: Layout): void
}>()

provide(isResizableKey, toRef(props, 'isResizable'))
provide(isDraggableKey, toRef(props, 'isDraggable'))
provide(colNumKey, toRef(props, 'colNum'))
provide(rowHeightKey, toRef(props, 'rowHeight'))

let layout: Layout
let originalLayout = props.layout

const responsiveGridLayout = () => {
  if (props.responsive) {
    if (breakpoint.layout.value) {
      layout = compact(breakpoint.layout.value, props.verticalCompact)
    }
    emit('layout-updated', layout)
    emit('breakpoint-changed', breakpoint.current.value, layout);
  } else {
    emit('layout-updated', originalLayout)
  }
}

watch([
  () => props.responsive,
  () => breakpoint.current.value
], () => {
  responsiveGridLayout()
}, { immediate: true })


watch([() => props.layout.length, () => props.layout], () => {
  compact(props.layout, props.verticalCompact)
  emit('update:layout', props.layout)
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

const step = computed(() => {
  const { stepSize } = props
  if (!stepSize) return false
  return stepSize == true ? {
    x: colW.value,
    y: props.rowHeight
  } : stepSize
})

provide(stepKey, step)

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

const placeholder = reactive<RequiredProps>({
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  i: -1
})

const isDragging = ref(false)

const resizeEvent: LayoutContext['resizeEvent'] = (event: EventParam) => {
  const { eventType, i, x, y, h, w } = event
  let lt = getLayoutItem(props.layout, i)

  let hasCollisions = false
  if (props.preventCollision) {
    const collisions = getAllCollisions(props.layout, { ...lt, w, h }).filter(layoutItem => layoutItem.i !== i)
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

  compact(props.layout, props.verticalCompact)
  emit('layout-updated', props.layout)
  const filed = fileds.get(i)
  filed?.createStyle()
}

const fileds = new Map<number | string, LayoutItemContext>()

/*****  drag  *****/
const dragEvent: LayoutContext['dragEvent'] = (event) => {
  const { eventType, i, x, y, h, w } = event
  const lt = getLayoutItem(props.layout, i)

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
  moveElement(props.layout, lt, x, y, true, props.preventCollision)
  compact(props.layout, props.verticalCompact)
  emit('layout-updated', props.layout)
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
.grid-layout {
  display: grid;
  position: relative;
}

.grid-placeholder {
  z-index: 2;
  user-select: none;
  background: pink;
  transition-duration: 100ms;
}
</style>