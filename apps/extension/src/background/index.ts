import { parseSyncNotificationId } from '../notifications'
import { isAcceptedSubmissionMessage } from '../types/messages'
import {
  enqueueAndSync,
  parseRetryAlarmName,
  resumePendingQueueItems,
  retryQueueItemNow,
} from './sync-engine'

chrome.runtime.onMessage.addListener((message: unknown) => {
  if (!isAcceptedSubmissionMessage(message)) return
  void enqueueAndSync(message)
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') return
  void chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/index.html') })
})

chrome.runtime.onStartup.addListener(() => {
  void resumePendingQueueItems()
})

chrome.alarms.onAlarm.addListener((alarm) => {
  const itemId = parseRetryAlarmName(alarm.name)
  if (itemId) void retryQueueItemNow(itemId)
})

chrome.notifications.onClicked.addListener((notificationId) => {
  const itemId = parseSyncNotificationId(notificationId)
  if (itemId) void retryQueueItemNow(itemId)
})
