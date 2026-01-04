import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate'
import './styles/global.css'
import './styles/themes.css'

// Component to handle service worker updates
function ServiceWorkerUpdater() {
  useServiceWorkerUpdate()
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServiceWorkerUpdater />
    <App />
  </StrictMode>
)

