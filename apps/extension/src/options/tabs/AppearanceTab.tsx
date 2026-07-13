import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@algoledger/ui'
import { Reveal } from '../../components/Reveal'

export function AppearanceTab() {
  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Theme customization is not available yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AlgoLedger currently follows your system&apos;s light/dark preference. Manual theme
            selection is planned for a future release.
          </p>
        </CardContent>
      </Card>
    </Reveal>
  )
}
