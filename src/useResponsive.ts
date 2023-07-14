import { computed, reactive } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ResponsiveLayout, Breakpoints, Layout } from './type'

export function useResponsive<K extends string = string>(breakpoints: Breakpoints<K>, responsiveLayout: ResponsiveLayout<K>) {
  const keys = Object.keys(breakpoints)
  keys.sort((a, b) => breakpoints[a as K] - breakpoints[b as K])

  const bpMap = reactive(new Map<string, Ref<boolean>>())

  keys.forEach(key => {
    if (!bpMap.has(key)) {
      bpMap.set(key, useMediaQuery(`(min-width: ${breakpoints[key as K]}px)`))
    }
  })

  const current = computed(() => {
    const bp: K[] = []
    for (const [key, val] of bpMap) {
      if (val.value) bp.push(key as K)
    }
    return bp
  })

  const layout = computed(() => {
    for (let i = current.value.length; i >= 0; i--) {
      const key = current.value[i]
      if (responsiveLayout[key]) return responsiveLayout[key]
    }
  })

  return {
    current,
    layout
  }
}

export type UseResponsiveReturn<K extends string = string> = {
  current: ComputedRef<K[]>
  layout: ComputedRef<Layout | undefined>
}