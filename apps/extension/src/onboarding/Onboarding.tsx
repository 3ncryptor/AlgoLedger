import { useState } from 'react'
import type { RepositoryListItem } from '@algoledger/github'
import { ChooseRepositoryStep } from './steps/ChooseRepositoryStep'
import { ConfirmConnectStep } from './steps/ConfirmConnectStep'
import { ConnectGitHubStep } from './steps/ConnectGitHubStep'
import { SuccessStep } from './steps/SuccessStep'

type Step = 'connect' | 'choose-repo' | 'confirm' | 'success'

export function Onboarding() {
  const [step, setStep] = useState<Step>('connect')
  const [token, setToken] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<RepositoryListItem | null>(null)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <h1 className="text-xl font-semibold">AlgoLedger</h1>

      {step === 'connect' && (
        <ConnectGitHubStep
          onConnected={(validatedToken) => {
            setToken(validatedToken)
            setStep('choose-repo')
          }}
        />
      )}

      {step === 'choose-repo' && (
        <ChooseRepositoryStep
          token={token}
          onSelect={(repository) => {
            setSelectedRepo(repository)
            setStep('confirm')
          }}
          onBack={() => setStep('connect')}
        />
      )}

      {step === 'confirm' && selectedRepo && (
        <ConfirmConnectStep
          token={token}
          repository={selectedRepo}
          onConnected={() => setStep('success')}
          onBack={() => setStep('choose-repo')}
        />
      )}

      {step === 'success' && <SuccessStep />}
    </main>
  )
}
