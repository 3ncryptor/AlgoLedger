import { describe, expect, test } from 'vitest'
import { getProblemFolderName } from '../src/folder-name'

describe('getProblemFolderName', () => {
  test('zero-pads the frontend id to 4 digits', () => {
    expect(getProblemFolderName('1', 'two-sum')).toBe('0001-two-sum')
    expect(getProblemFolderName('146', 'lru-cache')).toBe('0146-lru-cache')
    expect(getProblemFolderName('200', 'number-of-islands')).toBe('0200-number-of-islands')
  })

  test('does not truncate ids already 4+ digits', () => {
    expect(getProblemFolderName('12345', 'big-problem')).toBe('12345-big-problem')
  })
})
