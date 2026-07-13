import { describe, expect, test } from 'vitest'
import {
  buildMultiLineWordmarkGrid,
  buildWordmarkGrid,
  getMultiLineAspectRatio,
  getWordmarkAspectRatio,
} from '../../src/lib/heatmap-font'

describe('buildWordmarkGrid', () => {
  test('returns a 7-row grid matching the contribution heatmap Sun-Sat shape', () => {
    const grid = buildWordmarkGrid('A')

    expect(grid).toHaveLength(7)
  })

  test('renders the letter A as a 5-column glyph with the expected apex shape', () => {
    const grid = buildWordmarkGrid('A')

    expect(grid.every((row) => row.length === 5)).toBe(true)
    // Top row of "A" is the apex: middle three columns lit, outer two dark.
    expect(grid[0]).toEqual([false, true, true, true, false])
    // The crossbar row (index 3) is fully lit.
    expect(grid[3]).toEqual([true, true, true, true, true])
  })

  test('separates letters with a single blank gap column', () => {
    const grid = buildWordmarkGrid('AL')

    // 5 (A) + 1 (gap) + 5 (L) = 11 columns.
    expect(grid[0]).toHaveLength(11)
    const gapColumnIndex = 5
    expect(grid.every((row) => row[gapColumnIndex] === false)).toBe(true)
  })

  test('is case-sensitive — lowercase letters render at x-height, not the uppercase glyph', () => {
    expect(buildWordmarkGrid('a')).not.toEqual(buildWordmarkGrid('A'))
    // Lowercase "o" sits at x-height: its top two rows are blank, unlike uppercase letters.
    const lowerO = buildWordmarkGrid('o')
    expect(lowerO[0]!.every((cell) => cell === false)).toBe(true)
    expect(lowerO[1]!.every((cell) => cell === false)).toBe(true)
  })

  test('renders an unrecognized character as a blank glyph rather than throwing', () => {
    expect(() => buildWordmarkGrid('A1')).not.toThrow()
    const grid = buildWordmarkGrid('A1')
    const blankGlyphColumns = grid.map((row) => row.slice(6, 11))
    expect(blankGlyphColumns.every((row) => row.every((cell) => cell === false))).toBe(true)
  })
})

describe('getWordmarkAspectRatio', () => {
  test('returns columns divided by the fixed 7-row height', () => {
    // "AL" is 11 columns (see the gap test above) over 7 rows.
    expect(getWordmarkAspectRatio('AL')).toBeCloseTo(11 / 7)
  })
})

describe('buildMultiLineWordmarkGrid', () => {
  test('stacks each line with a 2-row blank gap between them', () => {
    const grid = buildMultiLineWordmarkGrid(['A', 'AL'])

    // 7 (A) + 2 (gap) + 7 (AL) = 16 rows.
    expect(grid).toHaveLength(16)
    // The gap rows (indices 7-8) are entirely blank.
    expect(grid[7]!.every((cell) => cell === false)).toBe(true)
    expect(grid[8]!.every((cell) => cell === false)).toBe(true)
  })

  test('center-pads narrower lines to the widest line width', () => {
    const grid = buildMultiLineWordmarkGrid(['A', 'AL'])

    // "AL" is the widest line (11 columns); every row, including "A"'s, matches that width.
    expect(grid.every((row) => row.length === 11)).toBe(true)
    // "A" (5 cols) centered in 11 columns pads 3 on the left, 3 on the right.
    const firstLineFirstRow = grid[0]!
    expect(firstLineFirstRow.slice(0, 3).every((cell) => cell === false)).toBe(true)
    expect(firstLineFirstRow.slice(8, 11).every((cell) => cell === false)).toBe(true)
  })
})

describe('getMultiLineAspectRatio', () => {
  test('returns the widest line width divided by the total stacked row count', () => {
    // "AL" is 11 columns wide; two 7-row lines plus a 2-row gap is 16 rows tall.
    expect(getMultiLineAspectRatio(['A', 'AL'])).toBeCloseTo(11 / 16)
  })
})
