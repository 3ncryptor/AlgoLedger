import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@algoledger/ui'
import { Reveal } from '../../components/Reveal'

const PLATFORMS = [
  { name: 'LeetCode', status: 'enabled' as const },
  { name: 'Codeforces', status: 'planned' as const },
  { name: 'HackerRank', status: 'planned' as const },
  { name: 'GeeksforGeeks', status: 'planned' as const },
]

export function PlatformsTab() {
  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>Platforms</CardTitle>
          <CardDescription>
            AlgoLedger currently captures accepted submissions from LeetCode. Support for additional
            platforms is on the roadmap.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="text-sm font-medium">{platform.name}</span>
              {platform.status === 'enabled' ? (
                <Badge variant="default">Enabled</Badge>
              ) : (
                <Badge variant="secondary">V2</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </Reveal>
  )
}
