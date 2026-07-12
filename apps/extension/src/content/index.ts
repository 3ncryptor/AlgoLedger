import { isAcceptedSubmissionMessage } from '../types/messages'

function injectMainWorldScript(): void {
  const script = document.createElement('script')
  script.type = 'module'
  script.src = chrome.runtime.getURL('injected.js')
  script.addEventListener('load', () => script.remove())
  ;(document.head ?? document.documentElement).appendChild(script)
}

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window || event.origin !== window.location.origin) return
  if (!isAcceptedSubmissionMessage(event.data)) return

  chrome.runtime.sendMessage(event.data)
})

injectMainWorldScript()
