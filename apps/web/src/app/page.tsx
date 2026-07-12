import { Button } from '@algoledger/ui'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">AlgoLedger</h1>
      <p className="text-neutral-500">
        Your accepted submissions, automatically archived as a structured GitHub knowledge base.
      </p>
      <Button>Install the extension</Button>
    </main>
  )
}
