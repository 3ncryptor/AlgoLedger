import type { SvgElementDef } from '@algoledger/ui'

export const DASHBOARD_ELEMENTS: SvgElementDef[] = [
  ['rect', { x: 3, y: 3, width: 8, height: 8, rx: 1.5, key: 'top-left' }],
  ['rect', { x: 13, y: 3, width: 8, height: 8, rx: 1.5, key: 'top-right' }],
  ['rect', { x: 3, y: 13, width: 8, height: 8, rx: 1.5, key: 'bottom-left' }],
  ['rect', { x: 13, y: 13, width: 8, height: 8, rx: 1.5, key: 'bottom-right' }],
]

export const KNOWLEDGE_GRAPH_ELEMENTS: SvgElementDef[] = [
  ['circle', { cx: 9, cy: 9, r: 6, key: 'left' }],
  ['circle', { cx: 15, cy: 9, r: 6, key: 'right' }],
  ['circle', { cx: 12, cy: 15, r: 6, key: 'bottom' }],
]

export const REPO_CONNECTED_ELEMENTS: SvgElementDef[] = [
  ['rect', { x: 3, y: 3, width: 18, height: 18, rx: 4, key: 'frame' }],
  ['path', { d: 'M8 12.5l3 3l5.5 -6.5', key: 'check' }],
]

export const EXTERNAL_LINK_ELEMENTS: SvgElementDef[] = [
  ['path', { d: 'M19 13v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h6', key: 'box' }],
  ['path', { d: 'M14 3h7v7', key: 'corner' }],
  ['path', { d: 'M21 3l-9 9', key: 'arrow' }],
]

export const SETTINGS_ELEMENTS: SvgElementDef[] = [
  ['line', { x1: 4, y1: 6, x2: 20, y2: 6, key: 'row-1' }],
  ['circle', { cx: 15, cy: 6, r: 2, key: 'knob-1' }],
  ['line', { x1: 4, y1: 12, x2: 20, y2: 12, key: 'row-2' }],
  ['circle', { cx: 9, cy: 12, r: 2, key: 'knob-2' }],
  ['line', { x1: 4, y1: 18, x2: 20, y2: 18, key: 'row-3' }],
  ['circle', { cx: 16, cy: 18, r: 2, key: 'knob-3' }],
]
