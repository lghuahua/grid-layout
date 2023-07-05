# grid-layout-vue

<p align="center">
 <img src="https://img.shields.io/npm/dm/grid-layout-vue.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/grid-layout-vue"><img src="https://img.shields.io/npm/v/grid-layout-vue.svg" alt="Version"></a>
  <a href="https://github.com/lghuahua/grid-layout/blob/main/LICENSE"><img src="https://img.shields.io/github/license/lghuahua/grid-layout" alt="License"></a>
  <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/grid-layout-vue">
</p>

grid-layout-vue使用grid布局与[vue-grid-layout](https://github.com/jbaysolutions/vue-grid-layout)略有不同

## 安装
```bash
npm install grid-layout-vue
# yarn
yarn add grid-layout-vue
```

## 使用
```vue
<template>
  <GridLayout :layout="state.layout" :isResizable="true" @layout-updated="update">
    <GridItem v-for="item, in state.layout"
      :key="item.i"
      :data-i="item.i"
      :static="item.static"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :i="item.i"
    >
      <div>{{ item.i }}</div>
    </GridItem>
  </GridLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { GridLayout, GridItem } from 'grid-layout-vue'
import 'grid-layout-vue/style.css'

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

```

## License

[MIT](https://github.com/lghuahua/grid-layout/blob/main/LICENSE)