<script setup lang="ts">
import GridLayout from '../src/gridLayout.vue'
import GridItem from '../src/gridItem.vue'
import { reactive, ref } from 'vue'
import { Layout, LayoutItem } from '../src/type'
const state = reactive<{
  layout: Layout,
  layoutC: Layout
}>({
  layout: [
    { "x": 0, "y": 0, "w": 2, "h": 1, "i": "0", minW: 2, static: false },
    { "x": 2, "y": 0, "w": 2, "h": 2, "i": "1", static: true },
    { "x": 4, "y": 0, "w": 2, "h": 3, "i": "2", static: false },
    { "x": 6, "y": 0, "w": 2, "h": 2, "i": "3", static: false },
    { "x": 8, "y": 0, "w": 2, "h": 2, "i": "4", static: false },
    { "x": 10, "y": 0, "w": 2, "h": 2, "i": "5", static: false },
    { "x": 0, "y": 5, "w": 2, "h": 3, "i": "6", static: false },
    { "x": 2, "y": 5, "w": 2, "h": 3, "i": "7", static: false },
    { "x": 4, "y": 5, "w": 2, "h": 3, "i": "8", static: false },
    { "x": 6, "y": 3, "w": 2, "h": 3, "i": "9", static: true },
    { "x": 8, "y": 4, "w": 2, "h": 3, "i": "10", static: false },
    { "x": 10, "y": 4, "w": 2, "h": 4, "i": "11", static: false },
    { "x": 0, "y": 10, "w": 2, "h": 5, "i": "12", static: false },
    { "x": 2, "y": 10, "w": 2, "h": 5, "i": "13", static: false },
    { "x": 4, "y": 8, "w": 2, "h": 4, "i": "14", static: false },
    { "x": 6, "y": 8, "w": 2, "h": 4, "i": "15", static: false },
    { "x": 8, "y": 10, "w": 2, "h": 5, "i": "16", static: false },
    { "x": 10, "y": 4, "w": 2, "h": 2, "i": "17", static: false },
    { "x": 0, "y": 9, "w": 2, "h": 3, "i": "18", static: false },
    { "x": 2, "y": 6, "w": 2, "h": 2, "i": "19", static: false, data: {} }
  ],
  layoutC: [
    { "x": 8, "y": 10, "w": 2, "h": 5, "i": "0", static: false },
    { "x": 10, "y": 4, "w": 2, "h": 2, "i": "1", static: false },
    { "x": 0, "y": 9, "w": 2, "h": 3, "i": "2", static: false },
    { "x": 2, "y": 6, "w": 2, "h": 2, "i": "3", static: false, data: {} }
  ]
})

const responsiveLayout = {
  md: [
    { "x": 0, "y": 0, "w": 2, "h": 2, "i": "0" },
    { "x": 2, "y": 0, "w": 2, "h": 4, "i": "1" },
    { "x": 4, "y": 0, "w": 2, "h": 5, "i": "2" },
    { "x": 6, "y": 0, "w": 2, "h": 3, "i": "3" },
    { "x": 2, "y": 4, "w": 2, "h": 3, "i": "4" },
    { "x": 4, "y": 5, "w": 2, "h": 3, "i": "5" },
    { "x": 0, "y": 2, "w": 2, "h": 5, "i": "6" },
    { "x": 2, "y": 7, "w": 2, "h": 5, "i": "7" },
    { "x": 4, "y": 8, "w": 2, "h": 5, "i": "8" },
    { "x": 6, "y": 3, "w": 2, "h": 4, "i": "9" },
    { "x": 0, "y": 7, "w": 2, "h": 4, "i": "10" },
    { "x": 2, "y": 19, "w": 2, "h": 4, "i": "11" },
    { "x": 0, "y": 14, "w": 2, "h": 5, "i": "12" },
    { "x": 2, "y": 14, "w": 2, "h": 5, "i": "13" },
    { "x": 4, "y": 13, "w": 2, "h": 4, "i": "14" },
    { "x": 6, "y": 7, "w": 2, "h": 4, "i": "15" },
    { "x": 0, "y": 19, "w": 2, "h": 5, "i": "16" },
    { "x": 8, "y": 0, "w": 2, "h": 2, "i": "17" },
    { "x": 0, "y": 11, "w": 2, "h": 3, "i": "18" },
    { "x": 2, "y": 12, "w": 2, "h": 2, "i": "19" }
  ],
  lg: [
    { "x": 0, "y": 0, "w": 2, "h": 2, "i": "0" },
    { "x": 2, "y": 0, "w": 2, "h": 4, "i": "1" },
    { "x": 4, "y": 0, "w": 2, "h": 5, "i": "2" },
    { "x": 6, "y": 0, "w": 2, "h": 3, "i": "3" },
    { "x": 8, "y": 0, "w": 2, "h": 3, "i": "4" },
    { "x": 10, "y": 0, "w": 2, "h": 3, "i": "5" },
    { "x": 0, "y": 5, "w": 2, "h": 5, "i": "6" },
    { "x": 2, "y": 5, "w": 2, "h": 5, "i": "7" },
    { "x": 4, "y": 5, "w": 2, "h": 5, "i": "8" },
    { "x": 6, "y": 4, "w": 2, "h": 4, "i": "9" },
    { "x": 8, "y": 4, "w": 2, "h": 4, "i": "10" },
    { "x": 10, "y": 4, "w": 2, "h": 4, "i": "11" },
    { "x": 0, "y": 10, "w": 2, "h": 5, "i": "12" },
    { "x": 2, "y": 10, "w": 2, "h": 5, "i": "13" },
    { "x": 4, "y": 8, "w": 2, "h": 4, "i": "14" },
    { "x": 6, "y": 8, "w": 2, "h": 4, "i": "15" },
    { "x": 8, "y": 10, "w": 2, "h": 5, "i": "16" },
    { "x": 10, "y": 4, "w": 2, "h": 2, "i": "17" },
    { "x": 0, "y": 9, "w": 2, "h": 3, "i": "18" },
    { "x": 2, "y": 6, "w": 2, "h": 2, "i": "19" }
  ],
}

let layout = ref(state.layout)

const update = (l: Layout) => {
  layout.value = l
}
const changeLayoutC = () => {
  layout.value = state.layoutC
}
const addItem = () => {
  layout.value.push({
    x: layout.value.length % 12,
    y: 5,
    w: 2,
    h: 2,
    i: layout.value.length
  })
}
const removeItem = (i: LayoutItem['i']) => {
  const index = layout.value.map(item => item.i).indexOf(i);
  layout.value.splice(index, 1);
}
const draggable = ref(true)
const resizable = ref(true)
const responsive = ref(false)

const breakpointChange = (bp: string[], layout: Layout) => {
  console.log('breakpoint change', bp, layout)
}

</script>

<template>
  <button @click="changeLayoutC">切换布局</button>
  <button @click="addItem">动态添加</button>
  <input type="checkbox" v-model="draggable" /> Draggable
  <input type="checkbox" v-model="resizable" /> Resizable
  <input type="checkbox" v-model="responsive" /> Responsive
  <GridLayout v-model:layout="layout" :isResizable="resizable" :is-draggable="draggable" :responsive="responsive"
    :responsive-layouts="responsiveLayout" @layout-updated="update" @breakpoint-changed="breakpointChange">
    <GridItem v-for="item in layout" :key="item.i" :data-i="item.i" :static="item.static" :x="item.x" :y="item.y"
      :w="item.w" :h="item.h" :i="item.i" :min-w="item.minW">
      <div>{{ item.i }}</div>
      <span class="remove" @click="removeItem(item.i)">x</span>
    </GridItem>
  </GridLayout>
</template>

<style scoped>
.grid-item:not(.grid-placeholder) {
  background: #ccc;
  border: 1px solid black;
}

.remove {
  position: absolute;
  right: 2px;
  top: 0;
  cursor: pointer;
}
</style>
