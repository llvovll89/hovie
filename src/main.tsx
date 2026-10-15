import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './refresh.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)

// Register after initial content is loaded so offline precaching does not compete with the hero.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { window.setTimeout(() => { void navigator.serviceWorker.register('/sw.js').catch(() => { /* The online experience remains available if offline setup fails. */ }) }, 4000) }, { once: true })
}
