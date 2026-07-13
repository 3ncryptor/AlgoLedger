import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@algoledger/ui'
import { CheckDraw } from '../../components/CheckDraw'
import { Reveal } from '../../components/Reveal'

export function SuccessStep() {
  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckDraw className="size-5 text-primary" />
            You&apos;re all set
          </CardTitle>
          <CardDescription>
            AlgoLedger will now commit your accepted LeetCode submissions to this repository.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.close()}>
            Close
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  )
}
