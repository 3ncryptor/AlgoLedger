import { Button } from '@algoledger/ui'

export function Popup() {
  return (
    <main className="w-80 p-4 font-sans text-neutral-900">
      <h1 className="text-lg font-semibold">AlgoLedger</h1>
      <p className="mt-1 text-sm text-neutral-500">Repository not connected yet.</p>
      <Button className="mt-4 w-full" onClick={() => chrome.runtime.openOptionsPage()}>
        Open Settings
      </Button>
    </main>
  )
}
