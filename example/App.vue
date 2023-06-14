<script setup lang="ts">
import GridLayout from '../src/gridLayout.vue'
import GridItem from '../src/gridItem.vue'
import { reactive } from 'vue'
import { Layout } from '../src/type'
const state = reactive<{
  layout: Layout
}>({layout: [
  {"x":0,"y":0,"w":2,"h":1,"i":"0", static: false},
  {"x":2,"y":0,"w":2,"h":2,"i":"1", static: true},
  {"x":4,"y":0,"w":2,"h":3,"i":"2", static: false},
  {"x":6,"y":0,"w":2,"h":2,"i":"3", static: false},
  {"x":8,"y":0,"w":2,"h":2,"i":"4", static: false},
  {"x":10,"y":0,"w":2,"h":2,"i":"5", static: false},
  {"x":0,"y":5,"w":2,"h":3,"i":"6", static: false},
  {"x":2,"y":5,"w":2,"h":3,"i":"7", static: false},
  {"x":4,"y":5,"w":2,"h":3,"i":"8", static: false},
  {"x":6,"y":3,"w":2,"h":3,"i":"9", static: true},
  {"x":8,"y":4,"w":2,"h":3,"i":"10", static: false},
  {"x":10,"y":4,"w":2,"h":4,"i":"11", static: false},
  {"x":0,"y":10,"w":2,"h":5,"i":"12", static: false},
  {"x":2,"y":10,"w":2,"h":5,"i":"13", static: false},
  {"x":4,"y":8,"w":2,"h":4,"i":"14", static: false},
  {"x":6,"y":8,"w":2,"h":4,"i":"15", static: false},
  {"x":8,"y":10,"w":2,"h":5,"i":"16", static: false},
  {"x":10,"y":4,"w":2,"h":2,"i":"17", static: false},
  {"x":0,"y":9,"w":2,"h":3,"i":"18", static: false},
  {"x":2,"y":6,"w":2,"h":2,"i":"19", static: false}
]})

const update = (layout: Layout) => {
  state.layout = layout
}
</script>

<template>
  <GridLayout :layout="state.layout" :isResizable="true" @layout-updated="update">
    <GridItem v-for="item, in state.layout" :key="item.i" :data-i="item.i" v-bind="item">{{ item.i }}</GridItem>
  </GridLayout>
</template>

<style scoped>
.grid-item:not(.grid-placeholder) {
    background: #ccc;
    border: 1px solid black;
}
</style>
