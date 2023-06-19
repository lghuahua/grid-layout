export type EventType = 'dragstart' | 'dragend' | 'dragmove' | 'resizestart' | 'resizeend' | 'resizemove'
export interface EventParam {
  eventType: EventType,
  i: number | string,
  x: number,
  y: number,
  w: number,
  h: number
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
  isResizable?: boolean,
  [prop: string]: any
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

export interface LayoutProps {
  colNum?: number,
  rowHeight?: number,
  gap?: number | number[],
  layout: Layout,
  isResizable?: boolean,
  isDraggable?: boolean,
  /**
   * 布局是否垂直压缩。
  */
  verticalCompact?: boolean,
  /**
   * 防止碰撞属性，值设置为 true 时，栅格只能拖动至空白处。
  */
  preventCollision?: boolean
}

export interface LayoutItemProps {
  isResizable?: boolean,
  isDraggable?: boolean,
  x: number,
  y: number,
  w: number,
  h: number,
  i: number | string,
  static?: boolean,
  dragIgnoreFrom?: string,
  dragAllowFrom?: string
}

export type Layout = Array<LayoutItem>