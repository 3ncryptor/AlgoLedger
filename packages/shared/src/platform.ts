export const PLATFORMS = ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'atcoder'] as const

export type Platform = (typeof PLATFORMS)[number]
