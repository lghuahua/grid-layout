// import type { App, Plugin } from 'vue'
// import GridItem from './gridItem.vue'
// import GridLayout from './gridLayout.vue'

// const install: Plugin = {
//   install(app: App) {
//     app.component('GridItem', GridItem)
//     app.component('GridLayout', GridLayout)
//   }
// }

// export default install

export { default as GridLayout } from './gridLayout.vue'
export { default as GridItem } from './gridItem.vue'
export type { Layout, LayoutItem } from './type'