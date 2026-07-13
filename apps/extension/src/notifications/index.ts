import type { Problem } from '@algoledger/schemas'

const NOTIFICATION_ICON = 'src/assets/icons/icon-128.png'
const SYNC_NOTIFICATION_PREFIX = 'algoledger:sync:'

function formatProblemLabel(problem: Problem): string {
  return `${problem.frontendId.padStart(4, '0')} ${problem.title}`
}

function formatDelay(delayMinutes: number): string {
  if (delayMinutes < 60) return `${delayMinutes} minute${delayMinutes === 1 ? '' : 's'}`
  const hours = delayMinutes / 60
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

/** Same id for every notification about one queue item, so retry/failure/success replace each other in place instead of stacking. */
export function syncNotificationId(queueItemId: string): string {
  return `${SYNC_NOTIFICATION_PREFIX}${queueItemId}`
}

export function parseSyncNotificationId(notificationId: string): string | null {
  return notificationId.startsWith(SYNC_NOTIFICATION_PREFIX)
    ? notificationId.slice(SYNC_NOTIFICATION_PREFIX.length)
    : null
}

export function notifySuccess(problem: Problem, queueItemId: string): void {
  chrome.notifications.create(syncNotificationId(queueItemId), {
    type: 'basic',
    iconUrl: chrome.runtime.getURL(NOTIFICATION_ICON),
    title: 'AlgoLedger',
    message: `✓ Successfully synced:\n${formatProblemLabel(problem)}`,
  })
}

export function notifyRetry(
  problem: Problem,
  attempt: number,
  maxAttempts: number,
  delayMinutes: number,
  queueItemId: string,
): void {
  chrome.notifications.create(syncNotificationId(queueItemId), {
    type: 'basic',
    iconUrl: chrome.runtime.getURL(NOTIFICATION_ICON),
    title: 'GitHub unavailable',
    message: `Retry ${attempt}/${maxAttempts}.\n\nNext attempt in ${formatDelay(delayMinutes)}.`,
  })
}

export function notifyFailure(problem: Problem, queueItemId: string): void {
  chrome.notifications.create(syncNotificationId(queueItemId), {
    type: 'basic',
    iconUrl: chrome.runtime.getURL(NOTIFICATION_ICON),
    title: 'Sync Failed',
    message: `${formatProblemLabel(problem)}\n\nClick to Retry.`,
  })
}
