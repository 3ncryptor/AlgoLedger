import { getProblemFolderName, planAcceptedSubmission } from '@algoledger/generators'
import { notifyFailure, notifyRetry, notifySuccess } from '../notifications'
import type { AcceptedSubmissionMessage } from '../types/messages'
import { getGitHubConfig, type GitHubConfig } from '../utils/config-storage'
import { createGitHubClientFromConfig } from '../utils/github-client'
import { fetchRepositoryState } from '../utils/repository-state'
import { clearSyncProgress, setSyncProgress } from '../utils/sync-progress'
import { PHASE_2_MAX_ATTEMPTS, PHASE_3_MAX_ATTEMPTS, decideNextRetry } from './retry-engine'
import {
  CURRENT_PLATFORM,
  enqueueAcceptedSubmission,
  getQueueItem,
  getResumableQueueItems,
  removeQueueItem,
  updateQueueItem,
} from './queue'

const PHASE_1_RETRY_DELAY_MS = 2000
const RETRY_ALARM_PREFIX = 'algoledger:retry:'

export function retryAlarmName(itemId: string): string {
  return `${RETRY_ALARM_PREFIX}${itemId}`
}

export function parseRetryAlarmName(alarmName: string): string | null {
  return alarmName.startsWith(RETRY_ALARM_PREFIX)
    ? alarmName.slice(RETRY_ALARM_PREFIX.length)
    : null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function commitSubmission(
  config: GitHubConfig,
  message: AcceptedSubmissionMessage,
  itemId: string,
): Promise<void> {
  const client = createGitHubClientFromConfig(config)
  const folder = getProblemFolderName(message.problem.frontendId, message.problem.slug)
  const folderId = `${CURRENT_PLATFORM}/${folder}`

  const reportStage = (stage: string, progress: number) =>
    setSyncProgress({
      itemId,
      problemTitle: message.problem.title,
      platform: CURRENT_PLATFORM,
      language: message.submission.language,
      stage,
      progress,
    })

  await reportStage('Fetching repository state...', 25)
  const state = await fetchRepositoryState(client, folderId)

  await reportStage('Preparing commit...', 50)
  const now = new Date().toISOString()
  const plan = planAcceptedSubmission(
    CURRENT_PLATFORM,
    message.problem,
    message.submission,
    state,
    now,
  )

  await reportStage('Updating Repository...', 75)
  for (const path of plan.deletePaths) {
    await client.deleteFile(path, plan.commitMessage)
  }
  await client.commitFiles(plan.commitFiles, plan.commitMessage)
}

// All sync attempts — whether triggered by a new submission, a retry alarm, a manual
// "click to retry", or startup resume — funnel through this chain so at most one commit is
// ever in flight at a time. Concurrent commits to the same branch would race on the same base
// ref and fail non-fast-forward, so serializing avoids wasted, easily-avoidable retries.
let syncChain: Promise<void> = Promise.resolve()

function scheduleAttempt(itemId: string): Promise<void> {
  const next = syncChain.then(() => attemptSync(itemId)).catch(() => undefined)
  syncChain = next
  return next
}

async function attemptSync(itemId: string): Promise<void> {
  const item = await getQueueItem(itemId)
  if (!item || item.status === 'syncing') return

  const config = await getGitHubConfig()
  if (!config) return // GitHub isn't connected yet; leave pending, don't burn retry attempts

  await updateQueueItem(itemId, { status: 'syncing' })

  try {
    await commitSubmission(config, item.message, itemId)
    await clearSyncProgress(itemId)
    await removeQueueItem(itemId)
    notifySuccess(item.message.problem, itemId)
  } catch (error) {
    await clearSyncProgress(itemId)
    const attemptsInPhase = item.attemptsInPhase + 1
    const decision = decideNextRetry(item.phase, attemptsInPhase)
    const lastError = error instanceof Error ? error.message : 'Unknown error'

    if (decision.action === 'fail') {
      await updateQueueItem(itemId, {
        status: 'failed',
        phase: item.phase,
        attemptsInPhase,
        lastError,
      })
      notifyFailure(item.message.problem, itemId)
      return
    }

    await updateQueueItem(itemId, {
      status: 'retrying',
      phase: decision.phase,
      attemptsInPhase: decision.attemptsInPhase,
      lastError,
    })

    if (decision.action === 'retry-immediately') {
      // Immediate phase-1 retries are expected to resolve within seconds — not worth an OS
      // notification per attempt, only the escalation to a real waiting phase is.
      await sleep(PHASE_1_RETRY_DELAY_MS)
      await attemptSync(itemId)
      return
    }

    const maxAttempts = decision.phase === 2 ? PHASE_2_MAX_ATTEMPTS : PHASE_3_MAX_ATTEMPTS
    notifyRetry(
      item.message.problem,
      decision.attemptsInPhase + 1,
      maxAttempts,
      decision.delayMinutes,
      itemId,
    )
    chrome.alarms.create(retryAlarmName(itemId), { delayInMinutes: decision.delayMinutes })
  }
}

export async function enqueueAndSync(message: AcceptedSubmissionMessage): Promise<void> {
  const item = await enqueueAcceptedSubmission(message)
  await scheduleAttempt(item.id)
}

export async function resumePendingQueueItems(): Promise<void> {
  const items = await getResumableQueueItems()
  for (const item of items) {
    await scheduleAttempt(item.id)
  }
}

export async function retryQueueItemNow(itemId: string): Promise<void> {
  const item = await getQueueItem(itemId)
  if (!item) return

  if (item.status === 'failed') {
    await updateQueueItem(itemId, { status: 'pending', phase: 1, attemptsInPhase: 0 })
  }

  await scheduleAttempt(itemId)
}
