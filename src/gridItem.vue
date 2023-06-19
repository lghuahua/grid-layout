<template>
<div ref="itemElement" class="grid-item" :style="style" :class="classObj">
  <slot />
  <span :class="resizableHandleClass"></span>
</div>
</template>
<script lang="ts" setup>
import { ref, inject, toRef, watch, nextTick, computed, reactive, onMounted, watchEffect, onBeforeUnmount } from 'vue'
import interact from 'interactjs'
import type { Interactable } from '@interactjs/core/Interactable'
import type { ResizeEvent, DragEvent } from '@interactjs/types/index'
import { layoutContextKey, isResizableKey, colNumKey, colWidthKey, rowHeightKey, gapKey, isDraggableKey } from './utils'
import { EventType, LayoutItemContext, LayoutItemProps } from './type'

const props = withDefaults(defineProps<LayoutItemProps>(), {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  i: -1,
  dragIgnoreFrom: 'a, button'
})

const layoutContext = inject(layoutContextKey)

const colNum = inject(colNumKey, ref(12))
const colWidth = inject(colWidthKey, ref(100))

const gap = inject(gapKey, ref([10, 10]))
const rowHeight = inject(rowHeightKey, ref(10))

const calcWH = (width: number, height: number) => {
  const [rowGap, colGap] = gap.value
  let w = Math.round((width + colGap) / (colWidth.value + colGap))
  let h = Math.round((height + rowGap) / (rowHeight.value + rowGap))

  return { w, h }
}

const calcXY = (top: number, left: number) => {
  const [rowGap, colGap] = gap.value
  let y = Math.round((top + rowGap) / (rowHeight.value + rowGap))
  let x = Math.round((left + colGap) / (colWidth.value + colGap))

  x = Math.max(Math.min(x, colNum.value - innerW.value), 0);

  return { x, y }
}

const previousW = ref(0)
const previousH = ref(0)
const previousX = ref(0)
const previousY = ref(0)
const innerX = ref(props.x)
const innerY = ref(props.y)
const innerW = ref(props.w)
const innerH = ref(props.h)

const resizableHandleClass = computed(() => {
  return 'resizable-handle'
})

const classObj = computed(() => {
  return {
    resizing: isResizing.value,
    static: props.static,
    'draggable-dragging': isDragging.value
  }
})

const itemElement = ref<HTMLElement>()
let interactObj: Interactable

function tryMakeResizable() {
  interactObj ||= interact(itemElement.value as HTMLElement)

  if (!props.static) {
    const opts = {
      edges: {
        left: `.${resizableHandleClass.value.trim().replace(' ', '.')}`,
        right: true,
        bottom: `.${resizableHandleClass.value.trim().replace(' ', '.')}`,
        top: false
      }
    }

    interactObj.resizable(opts)
    interactObj.on('resizestart resizemove resizeend', (event: ResizeEvent) => {
      handleResize(event)
    })
  } else {
    interactObj.resizable({ enabled: false })
  }
}

// 是否正在缩放状态
const isResizing = ref(false)
// 是否可缩放
const resizable = toRef(props, 'isResizable').value ? toRef(props, 'isResizable') : inject(isResizableKey, ref(true))
nextTick(() => {
  watch(resizable, () => {
    tryMakeResizable()
  }, {
    immediate: true
  })
})

let sizeChange = { width: 0, height: 0 }
const handleResize = (event: ResizeEvent) => {
  if (props.static) return
  const { type } = event
  const { width, height } = event.rect
  switch(type) {
    case 'resizestart':
      previousH.value = innerH.value
      previousW.value = innerW.value
      isResizing.value = true
      break;
    case 'resizemove':
      sizeChange = { width, height }
      break;
    case 'resizeend':
      sizeChange = { width: 0, height: 0 }

      isResizing.value = false
      break;
    default:
  }

  const pos = calcWH(width, height)

  layoutContext?.resizeEvent({
    eventType: type as EventType,
    i: props.i,
    x: innerX.value,
    y: innerY.value,
    w: pos.w,
    h: pos.h
  })
}

/**
 * 是否正在拖拽状态
 */
  const isDragging = ref(false)
/**
 * 是否可拖拽
 */
const draggable = toRef(props, 'isDraggable').value ? toRef(props, 'isDraggable') : inject(isDraggableKey, ref(true))
const dragging = { x: 0, y: 0, w: 0, h: 0 }
nextTick(() => {
  watch(draggable, () => {
    tryMakeDraggable()
  }, {
    immediate: true
  })
})

/**
 * 拖拽设置函数
 */
const tryMakeDraggable = () => {
  interactObj ||= interact(itemElement.value as HTMLElement)

  if (draggable.value && !props.static) {
    const opts = {
      ignoreFrom: props.dragIgnoreFrom,
      allowFrom: props.dragAllowFrom
    }

    interactObj.draggable(opts)
    interactObj.on('dragstart dragmove dragend', (event: DragEvent) => {
      handleDrag(event);
    })

  }
}

const handleDrag = (event: DragEvent) => {
  if (props.static || isResizing.value) return
  const { type } = event
  const { width, height, left, top } = event.rect

  switch(type) {
    case 'dragstart':
      previousX.value = innerX.value
      previousY.value = innerY.value
      dragging.w = width
      dragging.h = height
      dragging.x = left
      dragging.y = top

      isDragging.value = true
      break
    case 'dragmove':
      dragging.x = left
      dragging.y = top
      break
    case 'dragend':
      isDragging.value = false
      dragging.x = 0
      dragging.y = 0
      break
  }

  const pos = calcXY(top, left)

  layoutContext?.dragEvent({
    eventType: type as EventType,
    i: props.i,
    x: pos.x,
    y: pos.y,
    w: innerW.value,
    h: innerH.value
  })
}

const style = reactive<{
  gridArea?: string,
  width?: string,
  height?: string,
  transform?: string
}>({
  gridArea: '1 / 1 / 1 / 1'
})
const createStyle = () => {
  const { y, h } = props

  style.gridArea = `${y + 1} / ${innerX.value + 1} / ${y + 1 + h} / ${innerX.value + 1 + innerW.value}`
  if (isResizing.value) {
    // 设置缩放过程中的宽高
    const { width, height } = sizeChange
    style.width = width > 0 ? `${width}px` : undefined
    style.height = height > 0 ? `${height}px` : undefined
  } else {
    style.width = undefined
    style.height = undefined
  }

  if (isDragging.value) {
    const { x, y, w, h } = dragging
    style.width = w > 0 ? `${w}px` : undefined
    style.height = h > 0 ? `${h}px` : undefined
    style.transform = `translate(${x}px, ${y}px)`
    style.gridArea = undefined
  } else {
    style.transform = undefined
  }
}



const context: LayoutItemContext = reactive({
  $el: itemElement,
  i: props.i,
  createStyle
})

onMounted(() => {
  layoutContext?.addField(context)
  createStyle()
})

onBeforeUnmount(() => {
  layoutContext?.removeField(context)
})

watchEffect(() => {
  const { x, y, w, h } = props
  if (x + w > colNum.value) {
    innerX.value = 0
    innerW.value = Math.min(w, colNum.value)
  } else {
    innerX.value = x
    innerW.value = w
  }

  innerY.value = y
  innerH.value = h

  createStyle()
})

</script>
<style>
.grid-item > .resizable-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  padding: 0 3px 3px 0;
  cursor: se-resize;
  background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=');
  background-repeat: no-repeat;
  background-position: bottom right;
  background-origin: content-box;
}
.grid-item > .grid-placeholder{
  background: red;
  opacity: 0.2;
}
.grid-item.resizing{
  z-index: 3;
  opacity: 0.6;
}
.grid-item.draggable-dragging {
  z-index: 3;
  transition: none;
  position: absolute;
}
</style>