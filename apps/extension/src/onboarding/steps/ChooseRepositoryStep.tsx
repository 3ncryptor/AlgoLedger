import { useEffect, useState } from 'react'
import { GitHubClient, type RepositoryListItem } from '@algoledger/github'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@algoledger/ui'
import { Reveal } from '../../components/Reveal'

interface ChooseRepositoryStepProps {
  token: string
  onSelect: (repository: RepositoryListItem) => void
  onBack: () => void
}

export function ChooseRepositoryStep({ token, onSelect, onBack }: ChooseRepositoryStepProps) {
  const [client] = useState(() => new GitHubClient({ token, owner: '', repo: '', branch: '' }))
  const [repositories, setRepositories] = useState<RepositoryListItem[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<RepositoryListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadFirstPage() {
      try {
        const page = await client.listRepositories()
        if (!cancelled) {
          setRepositories(page.repositories)
          setHasNextPage(page.hasNextPage)
          setEndCursor(page.endCursor)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load repositories.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFirstPage()
    return () => {
      cancelled = true
    }
  }, [client])

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      const page = await client.listRepositories(endCursor)
      setRepositories((current) => [...current, ...page.repositories])
      setHasNextPage(page.hasNextPage)
      setEndCursor(page.endCursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load more repositories.')
    } finally {
      setLoadingMore(false)
    }
  }

  const filtered = repositories.filter((repository) =>
    repository.nameWithOwner.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>Choose a Repository</CardTitle>
          <CardDescription>
            Pick the GitHub repository AlgoLedger should commit your solved problems to.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {loading && <p className="text-sm text-muted-foreground">Loading repositories…</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && filtered.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">No repositories match your search.</p>
          )}

          <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
            {filtered.map((repository) => (
              <button
                key={repository.nameWithOwner}
                type="button"
                onClick={() => setSelected(repository)}
                className={
                  selected?.nameWithOwner === repository.nameWithOwner
                    ? 'rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm'
                    : 'rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted'
                }
              >
                {repository.nameWithOwner}
              </button>
            ))}
          </div>

          {hasNextPage && (
            <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={() => selected && onSelect(selected)}
              disabled={!selected}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  )
}
