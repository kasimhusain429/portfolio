import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

function DebugApp() {
  try {
    return <App />
  } catch (e) {
    return (
      <div style={{ padding: 24, color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>App crashed during render</div>
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', color: '#a5b4fc' }}>{String(e)}</pre>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DebugApp />
  </StrictMode>,
)
