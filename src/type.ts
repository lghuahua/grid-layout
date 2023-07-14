export type EventType = 'dragstart' | 'dragend' | 'dragmove' | 'resizestart' | 'resizeend' | 'resizemove'
export type RequiredProps = {
  i: number | string,
  x: number,
  y: number,
  w: number,
  h: number
}
export interface EventParam extends RequiredProps {
  eventType: EventType,
}

export type LayoutItem = LayoutItemProps & {
  moved?: boolean
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

export type Step = {
  x: number,
  y: number
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
  preventCollision?: boolean,
  /**
   * 设置移动步长，为 true 时x方向为列宽，y方向为行高，可自定义x, y
   * */
  stepSize?: Step | boolean,
  /** 布局是否为响应式 */
  responsive?: boolean,
  /** 如果 responsive 设置为 true，该配置将作为栅格中每个断点的初始布局。 */
  responsiveLayouts?: ResponsiveLayout,
  /**
   * 为响应式布局设置断点。
   * {@default}
   * ```ts
   * { xxs: 0, xs: 480, sm: 768, md: 992, lg: 1200, xl: 1920 }
   * ```
   * */
  breakpoints?: Breakpoints
}

export interface LayoutItemProps extends RequiredProps {
  isResizable?: boolean,
  isDraggable?: boolean,
  static?: boolean,
  dragIgnoreFrom?: string,
  dragAllowFrom?: string,
  minW?: number,
  maxW?: number,
  minH?: number,
  maxH?: number
}

export type Layout = Array<LayoutItem>

export type Breakpoints<K extends string = string> = Record<K, number>

export type ResponsiveLayout<K extends string = string> = Partial<Record<K, Layout>>
