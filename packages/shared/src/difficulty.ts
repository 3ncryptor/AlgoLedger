export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const

export type Difficulty = (typeof DIFFICULTIES)[number]
