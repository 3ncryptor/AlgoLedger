import type { RetryPhase } from './queue'

export const PHASE_1_MAX_ATTEMPTS = 5
export const PHASE_2_MAX_ATTEMPTS = 10
export const PHASE_3_MAX_ATTEMPTS = 10
export const PHASE_2_DELAY_MINUTES = 30
export const PHASE_3_DELAY_MINUTES = 120

export type RetryDecision =
  | { action: 'retry-immediately'; phase: RetryPhase; attemptsInPhase: number }
  | { action: 'schedule'; phase: RetryPhase; attemptsInPhase: number; delayMinutes: number }
  | { action: 'fail' }

/**
 * buildPlan section 19: phase 1 is 5 immediate attempts (the first sync attempt counts as
 * attempt 1 of phase 1), phase 2 is 10 attempts 30 minutes apart, phase 3 is 10 attempts 2 hours
 * apart. `attemptsInPhase` is the count AFTER the just-failed attempt.
 */
export function decideNextRetry(phase: RetryPhase, attemptsInPhase: number): RetryDecision {
  if (phase === 1) {
    if (attemptsInPhase < PHASE_1_MAX_ATTEMPTS) {
      return { action: 'retry-immediately', phase: 1, attemptsInPhase }
    }
    return { action: 'schedule', phase: 2, attemptsInPhase: 0, delayMinutes: PHASE_2_DELAY_MINUTES }
  }

  if (phase === 2) {
    if (attemptsInPhase < PHASE_2_MAX_ATTEMPTS) {
      return {
        action: 'schedule',
        phase: 2,
        attemptsInPhase,
        delayMinutes: PHASE_2_DELAY_MINUTES,
      }
    }
    return { action: 'schedule', phase: 3, attemptsInPhase: 0, delayMinutes: PHASE_3_DELAY_MINUTES }
  }

  if (attemptsInPhase < PHASE_3_MAX_ATTEMPTS) {
    return { action: 'schedule', phase: 3, attemptsInPhase, delayMinutes: PHASE_3_DELAY_MINUTES }
  }
  return { action: 'fail' }
}
