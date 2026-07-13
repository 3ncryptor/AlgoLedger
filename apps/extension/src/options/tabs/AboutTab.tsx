import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@algoledger/ui'
import { Reveal } from '../../components/Reveal'

export function AboutTab() {
  const version = chrome.runtime.getManifest().version

  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>About AlgoLedger</CardTitle>
          <CardDescription>Version {version}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            AlgoLedger converts your accepted LeetCode submissions into a structured,
            version-controlled GitHub knowledge repository.
          </p>
          <a
            href="https://github.com/3ncryptor/AlgoLedger"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            View source on GitHub
          </a>
        </CardContent>
      </Card>
    </Reveal>
  )
}
