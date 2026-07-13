import type { SvgElementDef } from '@algoledger/ui'

export const GITHUB_ELEMENTS: SvgElementDef[] = [
  ['path', { d: 'M8 4 3 12l5 8', key: 'left' }],
  ['path', { d: 'M16 4l5 8-5 8', key: 'right' }],
]

export const MAIL_ELEMENTS: SvgElementDef[] = [
  ['rect', { x: 2, y: 4, width: 20, height: 16, rx: 2, key: 'body' }],
  ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7', key: 'flap' }],
]

export const ARROW_RIGHT_ELEMENTS: SvgElementDef[] = [
  ['path', { d: 'M5 12h14', key: 'shaft' }],
  ['path', { d: 'm12 5 7 7-7 7', key: 'head' }],
]

export const BRANCH_ELEMENTS: SvgElementDef[] = [
  ['line', { x1: 6, y1: 3, x2: 6, y2: 15, key: 'trunk' }],
  ['circle', { cx: 18, cy: 6, r: 3, key: 'top-node' }],
  ['circle', { cx: 6, cy: 18, r: 3, key: 'bottom-node' }],
  ['path', { d: 'M18 9a9 9 0 0 1-9 9', key: 'branch' }],
]

export const TERMINAL_ELEMENTS: SvgElementDef[] = [
  ['rect', { x: 2, y: 4, width: 20, height: 16, rx: 2, key: 'frame' }],
  ['path', { d: 'm6 9 3 3-3 3', key: 'chevron' }],
  ['line', { x1: 12, y1: 15, x2: 16, y2: 15, key: 'cursor' }],
]

export const GRID_ELEMENTS: SvgElementDef[] = [
  ['rect', { x: 3, y: 3, width: 8, height: 8, rx: 1.5, key: 'top-left' }],
  ['rect', { x: 13, y: 3, width: 8, height: 8, rx: 1.5, key: 'top-right' }],
  ['rect', { x: 3, y: 13, width: 8, height: 8, rx: 1.5, key: 'bottom-left' }],
  ['rect', { x: 13, y: 13, width: 8, height: 8, rx: 1.5, key: 'bottom-right' }],
]

export const PULSE_ELEMENTS: SvgElementDef[] = [
  ['path', { d: 'M3 12h4l2-6 4 12 2-6h6', key: 'wave' }],
]

export const LOCK_ELEMENTS: SvgElementDef[] = [
  ['rect', { x: 4, y: 11, width: 16, height: 10, rx: 2, key: 'body' }],
  ['path', { d: 'M8 11V7a4 4 0 0 1 8 0v4', key: 'shackle' }],
]

export const ZAP_ELEMENTS: SvgElementDef[] = [
  ['path', { d: 'M13 3 4 14h6l-1 7 9-11h-6z', key: 'bolt' }],
]
