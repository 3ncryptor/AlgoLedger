import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Badge,
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
import { getGitHubConfig, setGitHubConfig, type GitHubConfig } from '../../utils/config-storage'
import { createGitHubClientFromConfig } from '../../utils/github-client'

const EMPTY_FORM: GitHubConfig = {
  githubPat: '',
  repoOwner: '',
  repoName: '',
  branch: 'main',
}

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'failed'

export function GitHubTab() {
  const [form, setForm] = useState<GitHubConfig>(EMPTY_FORM)
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getGitHubConfig().then((config) => {
      if (config) setForm(config)
    })
  }, [])

  function updateField<K extends keyof GitHubConfig>(key: K, value: GitHubConfig[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setStatus('idle')
  }

  async function handleTestConnection() {
    setStatus('testing')
    try {
      const client = createGitHubClientFromConfig(form)
      const exists = await client.repositoryExists()
      if (exists) {
        setStatus('connected')
        toast.success('Connected to the repository successfully.')
      } else {
        setStatus('failed')
        toast.error('Repository not found. Check the owner, name, and PAT permissions.')
      }
    } catch (error) {
      setStatus('failed')
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Connection failed: ${message}`)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await setGitHubConfig(form)
      toast.success('GitHub settings saved.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Could not save settings: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  const isFormComplete =
    form.githubPat.trim() !== '' &&
    form.repoOwner.trim() !== '' &&
    form.repoName.trim() !== '' &&
    form.branch.trim() !== ''

  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            GitHub Connection
            {status === 'connected' && <Badge variant="default">Connected</Badge>}
            {status === 'failed' && <Badge variant="destructive">Not connected</Badge>}
          </CardTitle>
          <CardDescription>
            AlgoLedger commits your solved problems directly to this repository. Your token is
            stored only in this browser&apos;s extension storage and is never sent anywhere except
            the GitHub API.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="githubPat">Personal Access Token</Label>
            <Input
              id="githubPat"
              type="password"
              autoComplete="off"
              placeholder="ghp_..."
              value={form.githubPat}
              onChange={(event) => updateField('githubPat', event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="repoOwner">Repository Owner</Label>
            <Input
              id="repoOwner"
              placeholder="your-github-username"
              value={form.repoOwner}
              onChange={(event) => updateField('repoOwner', event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="repoName">Repository Name</Label>
            <Input
              id="repoName"
              placeholder="algoledger"
              value={form.repoName}
              onChange={(event) => updateField('repoName', event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              placeholder="main"
              value={form.branch}
              onChange={(event) => updateField('branch', event.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!isFormComplete || status === 'testing'}
            >
              {status === 'testing' ? 'Testing…' : 'Test Connection'}
            </Button>
            <Button onClick={handleSave} disabled={!isFormComplete || saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  )
}
