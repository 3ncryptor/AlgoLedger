const GLYPH_HEIGHT = 7
const GLYPH_WIDTH = 5
const LETTER_GAP = 1

// Classic 5x7 bitmap font, 1 = lit cell. Only the letters actually used by the
// ALGOLEDGER wordmark are defined — this isn't a general-purpose font.
const LETTER_PATTERNS: Record<string, number[][]> = {
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  G: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  // Lowercase forms sit at x-height (blank top rows) so the real "AlgoLedger" casing — not an
  // all-caps stencil — is legible in the pixel grid. "l" keeps a full-height ascender.
  l: [
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  g: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
  ],
  o: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  e: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  d: [
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
  ],
  r: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
}

const BLANK_GLYPH: number[][] = Array.from({ length: GLYPH_HEIGHT }, () =>
  Array.from({ length: GLYPH_WIDTH }, () => 0),
)

const GAP_COLUMN: number[] = Array.from({ length: LETTER_GAP }, () => 0)

/**
 * Builds a `GLYPH_HEIGHT`-row boolean mask spelling `word` (case-sensitive — "AlgoLedger" renders
 * with its real mixed case, not as an all-caps stencil), one glyph column block per letter
 * separated by a blank gap column, matching a GitHub contribution heatmap's own 7-row (Sun-Sat)
 * shape so the wordmark can be rendered as heatmap cells.
 */
export function buildWordmarkGrid(word: string): boolean[][] {
  const letters = word.split('')

  const rows: number[][] = Array.from({ length: GLYPH_HEIGHT }, () => [])

  letters.forEach((letter, index) => {
    const glyph = LETTER_PATTERNS[letter] ?? BLANK_GLYPH

    for (let row = 0; row < GLYPH_HEIGHT; row++) {
      rows[row]!.push(...glyph[row]!)
      if (index < letters.length - 1) rows[row]!.push(...GAP_COLUMN)
    }
  })

  return rows.map((row) => row.map((cell) => cell === 1))
}

/** Column-to-row ratio of a wordmark grid — lets callers size a responsive container that fills
 * as much space as possible without exceeding either an available width or height. */
export function getWordmarkAspectRatio(word: string): number {
  const grid = buildWordmarkGrid(word)
  const cols = grid[0]?.length ?? 1
  const rows = grid.length || 1
  return cols / rows
}

const LINE_GAP = 2

function centerPadRow(row: boolean[], targetWidth: number): boolean[] {
  const totalPad = targetWidth - row.length
  const padLeft = Math.floor(totalPad / 2)
  const padRight = totalPad - padLeft
  return [
    ...Array.from({ length: padLeft }, () => false),
    ...row,
    ...Array.from({ length: padRight }, () => false),
  ]
}

/**
 * Stacks one heatmap grid per line (each still `GLYPH_HEIGHT` rows tall, separated by `LINE_GAP`
 * blank rows), center-padding narrower lines to the widest line's column count. Trades a very wide,
 * short single-line aspect ratio for a much more square one that can grow vertically without
 * either overflowing the viewport width or staying visually thin.
 */
export function buildMultiLineWordmarkGrid(lines: string[]): boolean[][] {
  const lineGrids = lines.map((line) => buildWordmarkGrid(line))
  const maxCols = Math.max(...lineGrids.map((grid) => grid[0]?.length ?? 0))
  const gapRow = Array.from({ length: maxCols }, () => false)

  const rows: boolean[][] = []
  lineGrids.forEach((grid, index) => {
    grid.forEach((row) => rows.push(centerPadRow(row, maxCols)))
    if (index < lineGrids.length - 1) {
      for (let i = 0; i < LINE_GAP; i++) rows.push([...gapRow])
    }
  })

  return rows
}

/** Same ratio helper as {@link getWordmarkAspectRatio}, for a multi-line grid. */
export function getMultiLineAspectRatio(lines: string[]): number {
  const grid = buildMultiLineWordmarkGrid(lines)
  const cols = grid[0]?.length ?? 1
  const rows = grid.length || 1
  return cols / rows
}
