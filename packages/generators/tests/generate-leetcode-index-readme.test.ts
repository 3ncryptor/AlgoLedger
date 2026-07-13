import { describe, expect, test } from 'vitest'
import { generateLeetcodeIndexReadme } from '../src/generate-leetcode-index-readme'
import type { ProblemIndexEntry } from '../src/stats/problem-index'

const twoSum: ProblemIndexEntry = {
  folderId: 'leetcode/0001-two-sum',
  frontendId: '1',
  title: 'Two Sum',
  slug: 'two-sum',
  difficulty: 'Easy',
  topics: ['Array', 'Hash Table'],
  language: 'python3',
  acceptedAt: '2026-07-10T10:00:00.000Z',
}

const threeSum: ProblemIndexEntry = {
  folderId: 'leetcode/0015-3sum',
  frontendId: '15',
  title: '3Sum',
  slug: '3sum',
  difficulty: 'Medium',
  topics: ['Array', 'Two Pointers'],
  language: 'cpp',
  acceptedAt: '2026-07-13T10:00:00.000Z',
}

const lruCache: ProblemIndexEntry = {
  folderId: 'leetcode/0146-lru-cache',
  frontendId: '146',
  title: 'LRU Cache',
  slug: 'lru-cache',
  difficulty: 'Hard',
  topics: ['Hash Table', 'Design'],
  language: 'python3',
  acceptedAt: '2026-07-12T10:00:00.000Z',
}

const entries = [threeSum, twoSum, lruCache]

describe('generateLeetcodeIndexReadme', () => {
  test('renders an empty-state message when no problems are solved yet', () => {
    const readme = generateLeetcodeIndexReadme([])

    expect(readme).toContain('No problems solved yet.')
  })

  test('renders the total-solved summary line with a per-difficulty breakdown', () => {
    const readme = generateLeetcodeIndexReadme(entries)

    expect(readme).toContain('**3** problems solved — 1 Easy · 1 Medium · 1 Hard')
  })

  test('lists problems in ascending problem-number order, with links to each problem folder', () => {
    const readme = generateLeetcodeIndexReadme(entries)
    const numberSection = readme.split('## By Difficulty')[0]!

    const twoSumIndex = numberSection.indexOf('[Two Sum](0001-two-sum/README.md)')
    const threeSumIndex = numberSection.indexOf('[3Sum](0015-3sum/README.md)')
    const lruIndex = numberSection.indexOf('[LRU Cache](0146-lru-cache/README.md)')

    expect(twoSumIndex).toBeGreaterThan(-1)
    expect(twoSumIndex).toBeLessThan(threeSumIndex)
    expect(threeSumIndex).toBeLessThan(lruIndex)
  })

  test('groups problems into a subsection per difficulty', () => {
    const readme = generateLeetcodeIndexReadme(entries)

    expect(readme).toContain('### Easy (1)')
    expect(readme).toContain('### Medium (1)')
    expect(readme).toContain('### Hard (1)')
  })

  test('lists a problem under every topic it is tagged with (categorical, non-exclusive indexing)', () => {
    const readme = generateLeetcodeIndexReadme(entries)

    // Array covers both Two Sum and 3Sum; Hash Table covers Two Sum and LRU Cache.
    expect(readme).toContain('<summary>Array (2)</summary>')
    expect(readme).toContain('<summary>Hash Table (2)</summary>')
    expect(readme).toContain('<summary>Two Pointers (1)</summary>')
    expect(readme).toContain('<summary>Design (1)</summary>')
  })

  test('groups problems by submitted language', () => {
    const readme = generateLeetcodeIndexReadme(entries)

    expect(readme).toContain('<summary>python3 (2)</summary>')
    expect(readme).toContain('<summary>cpp (1)</summary>')
  })

  test('lists recently solved problems most-recent first', () => {
    const readme = generateLeetcodeIndexReadme(entries)
    const recentSection = readme.split('## Recently Solved')[1]!

    const threeSumIndex = recentSection.indexOf('3Sum')
    const lruIndex = recentSection.indexOf('LRU Cache')
    const twoSumIndex = recentSection.indexOf('Two Sum')

    expect(threeSumIndex).toBeLessThan(lruIndex)
    expect(lruIndex).toBeLessThan(twoSumIndex)
  })
})
