import { describe, expect, test } from 'vitest'
import { decideNextRetry } from '../../src/background/retry-engine'

describe('decideNextRetry', () => {
  test('retries immediately while phase 1 attempts remain below the max', () => {
    expect(decideNextRetry(1, 1)).toEqual({
      action: 'retry-immediately',
      phase: 1,
      attemptsInPhase: 1,
    })
    expect(decideNextRetry(1, 4)).toEqual({
      action: 'retry-immediately',
      phase: 1,
      attemptsInPhase: 4,
    })
  })

  test('escalates from phase 1 to phase 2 after 5 attempts', () => {
    expect(decideNextRetry(1, 5)).toEqual({
      action: 'schedule',
      phase: 2,
      attemptsInPhase: 0,
      delayMinutes: 30,
    })
  })

  test('schedules a 30 minute retry while phase 2 attempts remain below the max', () => {
    expect(decideNextRetry(2, 1)).toEqual({
      action: 'schedule',
      phase: 2,
      attemptsInPhase: 1,
      delayMinutes: 30,
    })
    expect(decideNextRetry(2, 9)).toEqual({
      action: 'schedule',
      phase: 2,
      attemptsInPhase: 9,
      delayMinutes: 30,
    })
  })

  test('escalates from phase 2 to phase 3 after 10 attempts', () => {
    expect(decideNextRetry(2, 10)).toEqual({
      action: 'schedule',
      phase: 3,
      attemptsInPhase: 0,
      delayMinutes: 120,
    })
  })

  test('schedules a 2 hour retry while phase 3 attempts remain below the max', () => {
    expect(decideNextRetry(3, 1)).toEqual({
      action: 'schedule',
      phase: 3,
      attemptsInPhase: 1,
      delayMinutes: 120,
    })
    expect(decideNextRetry(3, 9)).toEqual({
      action: 'schedule',
      phase: 3,
      attemptsInPhase: 9,
      delayMinutes: 120,
    })
  })

  test('gives up after phase 3 exhausts its 10 attempts', () => {
    expect(decideNextRetry(3, 10)).toEqual({ action: 'fail' })
  })
})
