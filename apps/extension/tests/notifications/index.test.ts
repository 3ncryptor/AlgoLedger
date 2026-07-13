import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  notifyFailure,
  notifyRetry,
  notifySuccess,
  parseSyncNotificationId,
  syncNotificationId,
} from '../../src/notifications'
import { twoSumProblem } from '../fixtures'

describe('notifications', () => {
  let createMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createMock = vi.fn()
    vi.stubGlobal('chrome', {
      notifications: { create: createMock },
      runtime: { getURL: (path: string) => `chrome-extension://test/${path}` },
    })
  })

  test('syncNotificationId and parseSyncNotificationId round-trip a queue item id', () => {
    const id = syncNotificationId('leetcode/0001-two-sum')
    expect(parseSyncNotificationId(id)).toBe('leetcode/0001-two-sum')
  })

  test('parseSyncNotificationId returns null for an unrelated notification id', () => {
    expect(parseSyncNotificationId('some-other-notification')).toBeNull()
  })

  test('notifySuccess creates a basic notification with the problem label', () => {
    notifySuccess(twoSumProblem, 'leetcode/0001-two-sum')

    const [id, options] = createMock.mock.calls[0] as [
      string,
      chrome.notifications.NotificationOptions,
    ]
    expect(id).toBe('algoledger:sync:leetcode/0001-two-sum')
    expect(options.message).toBe('✓ Successfully synced:\n0001 Two Sum')
  })

  test('notifyRetry formats delays under an hour as minutes', () => {
    notifyRetry(twoSumProblem, 3, 10, 30, 'leetcode/0001-two-sum')

    const [, options] = createMock.mock.calls[0] as [
      string,
      chrome.notifications.NotificationOptions,
    ]
    expect(options.title).toBe('GitHub unavailable')
    expect(options.message).toBe('Retry 3/10.\n\nNext attempt in 30 minutes.')
  })

  test('notifyRetry formats delays of 60+ minutes as hours', () => {
    notifyRetry(twoSumProblem, 1, 10, 120, 'leetcode/0001-two-sum')

    const [, options] = createMock.mock.calls[0] as [
      string,
      chrome.notifications.NotificationOptions,
    ]
    expect(options.message).toBe('Retry 1/10.\n\nNext attempt in 2 hours.')
  })

  test('notifyFailure tells the user to click to retry', () => {
    notifyFailure(twoSumProblem, 'leetcode/0001-two-sum')

    const [, options] = createMock.mock.calls[0] as [
      string,
      chrome.notifications.NotificationOptions,
    ]
    expect(options.title).toBe('Sync Failed')
    expect(options.message).toBe('0001 Two Sum\n\nClick to Retry.')
  })
})
