export const SYNC_PROGRESS_STORAGE_KEY = 'algoledger:current-sync'

export interface SyncProgressState {
  itemId: string
  problemTitle: string
  platform: string
  language: string
  stage: string
  progress: number
}

export async function setSyncProgress(state: SyncProgressState): Promise<void> {
  await chrome.storage.local.set({ [SYNC_PROGRESS_STORAGE_KEY]: state })
}

export async function getSyncProgress(): Promise<SyncProgressState | null> {
  const stored =
    await chrome.storage.local.get<
      Record<typeof SYNC_PROGRESS_STORAGE_KEY, SyncProgressState | undefined>
    >(SYNC_PROGRESS_STORAGE_KEY)
  return stored[SYNC_PROGRESS_STORAGE_KEY] ?? null
}

/** Only clears if the stored progress still refers to this item, defending against a stale
 * clear racing a newer item (sync attempts are serialized, so this shouldn't happen in practice). */
export async function clearSyncProgress(itemId: string): Promise<void> {
  const current = await getSyncProgress()
  if (current?.itemId === itemId) {
    await chrome.storage.local.remove(SYNC_PROGRESS_STORAGE_KEY)
  }
}
