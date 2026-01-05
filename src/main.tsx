import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate'
import { UpdateToast } from './components/UpdateToast'
import './styles/global.css'
import './styles/themes.css'

// Component to handle service worker updates and show notification
function ServiceWorkerUpdater() {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate()
  return <UpdateToast visible={updateAvailable} onUpdate={applyUpdate} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServiceWorkerUpdater />
    <App />
  </StrictMode>
)
