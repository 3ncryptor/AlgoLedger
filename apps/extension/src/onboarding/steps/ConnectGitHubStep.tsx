import { useState } from 'react'
import { GitHubClient } from '@algoledger/github'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@algoledger/ui'
import { Reveal } from '../../components/Reveal'

interface ConnectGitHubStepProps {
  onConnected: (token: string) => void
}

export function ConnectGitHubStep({ onConnected }: ConnectGitHubStepProps) {
  const [token, setToken] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    setValidating(true)
    setError(null)
    try {
      const client = new GitHubClient({ token, owner: '', repo: '', branch: '' })
      await client.getViewer()
      onConnected(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not validate this token.')
    } finally {
      setValidating(false)
    }
  }

  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>Connect GitHub</CardTitle>
          <CardDescription>
            AlgoLedger needs a Personal Access Token to commit your solved problems to a repository
            you choose.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="onboarding-pat">Personal Access Token</Label>
            <Input
              id="onboarding-pat"
              type="password"
              autoComplete="off"
              placeholder="ghp_..."
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleContinue} disabled={token.trim() === '' || validating}>
            {validating ? 'Validating…' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  )
}
