export interface EventParam {
  eventType: string,
  i: number | string,
  x: number,
  y: number,
  w: number,
  h: number
}

export interface Events {
  resizeEvent: EventParam,
  compact: string,
  dragEvent: EventParam
}

export type LayoutItem = {
  x: number,
  y: number,
  w: number,
  h: number,
  i: number | string,
  static?: boolean
  moved?: boolean
  isDraggable?: boolean
  isResizable?: boolean
}

export interface LayoutItemContext {
  $el: HTMLElement | undefined,
  i: number | string,
  createStyle: () => void
}

export interface LayoutContext {
  addField: (field: LayoutItemContext) => void,
  removeField: (field: LayoutItemContext) => void,
  dragEvent: (event: EventParam) => void,
  resizeEvent: (event: EventParam) => void
}

export type Layout = Array<LayoutItem>