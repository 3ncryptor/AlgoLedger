import { describe, expect, test } from 'vitest'
import { generateSolutionFile } from '../src/generate-solution-file'
import { acceptedSubmission } from './fixtures'

describe('generateSolutionFile', () => {
  test('prepends a runtime/memory header using the language comment style', () => {
    const file = generateSolutionFile(acceptedSubmission)

    expect(file.path).toBe('solution.py')
    expect(file.content).toBe(`# Runtime: 0 ms\n# Memory: 18 MB\n\n${acceptedSubmission.typedCode}`)
  })

  test('uses // comments for a C-family language', () => {
    const cppSubmission = {
      ...acceptedSubmission,
      language: 'cpp',
      typedCode: 'class Solution {};',
    }
    const file = generateSolutionFile(cppSubmission)

    expect(file.path).toBe('solution.cpp')
    expect(file.content.startsWith('// Runtime: 0 ms\n// Memory: 18 MB\n\n')).toBe(true)
  })

  test('omits the header when runtime/memory are unavailable', () => {
    const submissionWithoutStats = { ...acceptedSubmission, runtime: undefined, memory: undefined }
    const file = generateSolutionFile(submissionWithoutStats)

    expect(file.content).toBe(acceptedSubmission.typedCode)
  })
})
