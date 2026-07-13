import { Card, CardContent, Progress } from '@algoledger/ui'
import { Reveal } from '../components/Reveal'

interface SyncScreenProps {
  problem: string
  platform: string
  language: string
  progress: number
}

export function SyncScreen({ problem, platform, language, progress }: SyncScreenProps) {
  return (
    <Reveal>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <span className="text-sm font-medium">Syncing Submission</span>

          <div className="flex flex-col gap-1 text-sm">
            <span>
              <span className="text-muted-foreground">Problem: </span>
              {problem}
            </span>
            <span>
              <span className="text-muted-foreground">Platform: </span>
              {platform}
            </span>
            <span>
              <span className="text-muted-foreground">Language: </span>
              {language}
            </span>
          </div>

          <Progress value={progress} />

          <span className="text-xs text-muted-foreground">Updating Repository...</span>
        </CardContent>
      </Card>
    </Reveal>
  )
}
