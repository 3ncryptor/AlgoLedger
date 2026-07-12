export const SYNC_STATUSES = ['pending', 'syncing', 'synced', 'retrying', 'failed'] as const

export type SyncStatus = (typeof SYNC_STATUSES)[number]
