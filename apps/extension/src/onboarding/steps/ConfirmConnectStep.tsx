import { useState } from 'react'
import { bootstrapRepository, type RepositoryListItem } from '@algoledger/github'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@algoledger/ui'
import { Reveal } from '../../components/Reveal'
import { setGitHubConfig } from '../../utils/config-storage'
import { createGitHubClientFromConfig } from '../../utils/github-client'

interface ConfirmConnectStepProps {
  token: string
  repository: RepositoryListItem
  onConnected: () => void
  onBack: () => void
}

export function ConfirmConnectStep({
  token,
  repository,
  onConnected,
  onBack,
}: ConfirmConnectStepProps) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    setConnecting(true)
    setError(null)
    try {
      const config = {
        githubPat: token,
        repoOwner: repository.owner,
        repoName: repository.name,
        branch: repository.defaultBranch,
      }
      const client = createGitHubClientFromConfig(config)
      await bootstrapRepository(client)
      await setGitHubConfig(config)
      onConnected()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect this repository.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>Confirm Connection</CardTitle>
          <CardDescription>Review before AlgoLedger starts committing here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <span>
              <span className="text-muted-foreground">Repository: </span>
              {repository.nameWithOwner}
            </span>
            <span>
              <span className="text-muted-foreground">Branch: </span>
              {repository.defaultBranch}
            </span>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack} disabled={connecting}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Connecting…' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  )
}
