import { createRoot } from 'react-dom/client'
import { Options } from './Options'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

createRoot(container).render(<Options />)
