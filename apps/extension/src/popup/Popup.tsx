import { useEffect, useState } from 'react'
import type { NameIndex, Stats } from '@algoledger/generators'
import { Button, Toaster } from '@algoledger/ui'
import { getGitHubConfig } from '../utils/config-storage'
import { createGitHubClientFromConfig } from '../utils/github-client'
import { folderIdToTitle } from '../utils/folder-id'
import { getContributionGrid, type ContributionGrid } from '../utils/heatmap'
import { fetchRemoteStats } from '../utils/stats-storage'
import {
  SYNC_PROGRESS_STORAGE_KEY,
  getSyncProgress,
  type SyncProgressState,
} from '../utils/sync-progress'
import { KnowledgeGraphPage } from './KnowledgeGraphPage'
import { Navbar, type PopupPage } from './Navbar'
import { PopupDashboard } from './PopupDashboard'
import { PopupSkeleton } from './PopupSkeleton'
import { SyncScreen } from './SyncScreen'
import { TopBar } from './TopBar'

const RECENT_SYNCS_LIMIT = 3

interface ReadyData {
  repoOwner: string
  repoName: string
  branch: string
  totalSolved: number
  byDifficulty: Stats['byDifficulty']
  currentStreak: number
  longestStreak: number
  recentSyncs: { folderId: string; title: string }[]
  contributionGrid: ContributionGrid
  topicIndex: NameIndex
}

type PopupState =
  | { status: 'not-configured' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'syncing'; sync: SyncProgressState }
  | ({ status: 'ready' } & ReadyData)

function capitalize(value: string): string {
  return value.length > 0 ? value[0]!.toUpperCase() + value.slice(1) : value
}

export function Popup() {
  const [state, setState] = useState<PopupState>({ status: 'loading' })
  const [page, setPage] = useState<PopupPage>('dashboard')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const syncProgress = await getSyncProgress()
      if (syncProgress) {
        if (!cancelled) setState({ status: 'syncing', sync: syncProgress })
        return
      }

      const config = await getGitHubConfig()
      if (!config) {
        if (!cancelled) setState({ status: 'not-configured' })
        return
      }

      try {
        const client = createGitHubClientFromConfig(config)
        const { stats, topicIndex, platformIndex } = await fetchRemoteStats(client)

        const recentSyncs = (platformIndex.leetcode ?? [])
          .slice(-RECENT_SYNCS_LIMIT)
          .reverse()
          .map((folderId) => ({ folderId, title: folderIdToTitle(folderId) }))

        const today = new Date().toISOString().slice(0, 10)

        if (!cancelled) {
          setState({
            status: 'ready',
            repoOwner: config.repoOwner,
            repoName: config.repoName,
            branch: config.branch,
            totalSolved: stats.totalSolved,
            byDifficulty: stats.byDifficulty,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            recentSyncs,
            contributionGrid: getContributionGrid(today, stats.activityByDate),
            topicIndex,
          })
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          setState({ status: 'error', message })
        }
      }
    }

    load()

    function handleStorageChange(changes: Record<string, chrome.storage.StorageChange>) {
      if (!(SYNC_PROGRESS_STORAGE_KEY in changes)) return

      const newValue = changes[SYNC_PROGRESS_STORAGE_KEY]?.newValue as SyncProgressState | undefined

      if (newValue) {
        setState({ status: 'syncing', sync: newValue })
      } else if (!cancelled) {
        // The sync just finished (success or failure) — reload the dashboard.
        load()
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      cancelled = true
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  return (
    <main className="h-[640px] w-[480px] overflow-y-auto font-sans">
      {state.status === 'not-configured' && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Repository not connected yet.</p>
          <Button
            className="mt-4 w-full"
            onClick={() =>
              chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/index.html') })
            }
          >
            Get Started
          </Button>
        </div>
      )}

      {state.status === 'loading' && <PopupSkeleton />}

      {state.status === 'error' && (
        <p className="p-4 text-sm text-destructive">Could not load stats: {state.message}</p>
      )}

      {state.status === 'syncing' && (
        <div className="p-4">
          <SyncScreen
            problem={state.sync.problemTitle}
            platform={capitalize(state.sync.platform)}
            language={capitalize(state.sync.language)}
            progress={state.sync.progress}
            statusText={state.sync.stage}
          />
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <TopBar repoOwner={state.repoOwner} repoName={state.repoName} />
          <Navbar page={page} onNavigate={setPage} />

          {page === 'dashboard' && (
            <PopupDashboard
              repoOwner={state.repoOwner}
              repoName={state.repoName}
              branch={state.branch}
              totalSolved={state.totalSolved}
              byDifficulty={state.byDifficulty}
              currentStreak={state.currentStreak}
              longestStreak={state.longestStreak}
              recentSyncs={state.recentSyncs}
              contributionGrid={state.contributionGrid}
              topicIndex={state.topicIndex}
            />
          )}

          {page === 'knowledge' && <KnowledgeGraphPage topicIndex={state.topicIndex} />}
        </>
      )}

      <Toaster />
    </main>
  )
}
