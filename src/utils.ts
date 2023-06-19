import type { InjectionKey, Ref } from 'vue'
import { Layout, LayoutItem, LayoutContext } from './type'

export const layoutContextKey: InjectionKey<LayoutContext> = Symbol('layoutContext')
export const isResizableKey: InjectionKey<Ref<boolean>> = Symbol('isResizable')
export const isDraggableKey: InjectionKey<Ref<boolean>> = Symbol('isDraggable')
export const colNumKey: InjectionKey<Ref<number>> = Symbol('colNum')
export const colWidthKey: InjectionKey<Ref<number>> = Symbol('colWidth')
export const rowHeightKey: InjectionKey<Ref<number>> = Symbol('rowHeight')
export const gapKey: InjectionKey<Ref<number[]>> = Symbol('gap')

export function sortLayoutItemsByRowCol(layout: Layout): Layout {
  return layout.sort((a, b) => {
    if (a.y === b.y && a.x === b.x) {
      return 0;
    }

    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    }

    return -1;
  })
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
export function getStatics(layout: Layout): Layout {
  return layout.filter(l => l.static)
}

/**
 * Given two layoutitems, check if they collide.
 *
 * @return {Boolean}   True if colliding.
 */
export function collides(lt1: LayoutItem, lt2: LayoutItem): boolean {
  if (lt1 === lt2) return false; // same element
  if (lt1.x + lt1.w <= lt2.x) return false; // lt1 is left of lt2
  if (lt1.x >= lt2.x + lt2.w) return false; // lt1 is right of lt2
  if (lt1.y + lt1.h <= lt2.y) return false; // lt1 is above lt2
  if (lt1.y >= lt2.y + lt2.h) return false; // lt1 is below lt2
  return true; // boxes overlap
}

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|void}  A colliding layout item, or void.
 */
export function getFirstCollision(layout: Layout, layoutItem: LayoutItem): LayoutItem | void {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}

/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @param {Object} minPositions
 * @return {Array}       Compacted Layout.
 */
export function compact(layout: Layout, verticalCompact: boolean): Layout {
  const compareWith = getStatics(layout)
  const sorted = sortLayoutItemsByRowCol(layout)

  const out:Layout = []

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = sorted[i]

    // Don't move static elements
    if (!l.static) {
      l = compactItem(compareWith, l, verticalCompact)

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l)
    }
    out[layout.indexOf(l)] = l

    l.moved = false
  }

  return out
}

/**
 * Compact an item in the layout.
 */
export function compactItem(compareWith: Layout, item: LayoutItem, verticalCompact: boolean): LayoutItem {
  if (verticalCompact) {
    // Move the element up as far as it can go without colliding.
    while (item.y > 0 && !getFirstCollision(compareWith, item)) {
      item.y--
    }
  }
  // Move it down, and keep moving it down if it's colliding.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let collides = {} as LayoutItem | void;
  while ((collides = getFirstCollision(compareWith, item))) {
    item.y = collides.y + collides.h;
  }
  return item
}
export function getLayoutItem(layout: Layout, id: string | number): LayoutItem {
  const lt = layout.find(item => item.i == id)
  return lt ?? { h: 0, w: 0, x: 0, y: 0, i: id }
}

export function getAllCollisions(layout: Layout, layoutItem: LayoutItem): Layout {
  return layout.filter(l => collides(l, layoutItem))
}

/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * @param  {Array}      layout Full layout to modify.
 * @param  {LayoutItem} l      element to move.
 * @param  {Number}     [x]    X position in grid units.
 * @param  {Number}     [y]    Y position in grid units.
 * @param  {Boolean}    [isUserAction] If true, designates that the item we're moving is
 *                                     being dragged/resized by th euser.
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  x: number | void,
  y: number,
  isUserAction: boolean,
  preventCollision = false,
) {
  if (l.static) return layout

  const oldX = l.x
  const oldY = l.y
  const movingUp = y && l.y > y

  if (typeof x === 'number') l.x = x
  l.y = y
  l.moved = true

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  let sorted = sortLayoutItemsByRowCol(layout)
  if (movingUp) sorted = sorted.reverse()
  const collisions = getAllCollisions(sorted, l)

  if (preventCollision && collisions.length) {
    l.x = oldX
    l.y = oldY
    l.moved = false
    return layout
  }

  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i]
    // console.log('resolving collision between', l.i, 'at', l.y, 'and', collision.i, 'at', collision.y);

    // Short circuit so we can't infinite loop
    if (collision.moved) continue

    // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction)
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction)
    }
  }
  return layout
}

/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 * @param  {Boolean} [isUserAction]  If true, designates that the item we're moving is being dragged/resized
 *                                   by the user.
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction: boolean,
) {
  const preventCollision = false; // we're already colliding
  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.
  if (isUserAction) {
    // Make a mock item so we don't modify the item here, only modify in moveElement.
    const fakeItem: LayoutItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1',
    };
    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0)
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(layout, itemToMove, undefined, fakeItem.y, preventCollision)
    }
  }

  // Previously this was optimized to move below the collision directly, but this can cause problems
  // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
  return moveElement(layout, itemToMove, undefined, itemToMove.y + 1, preventCollision)
}