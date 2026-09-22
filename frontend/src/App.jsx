import { useEffect, useState } from 'react'
import StatusMessage from './components/StatusMessage'

function App() {
  const [status, setStatus] = useState({
    message: '',
    type: '',
  })

  useEffect(() => {
    function handleStatus(event) {
      setStatus(event.detail)
    }

    window.addEventListener('status-update', handleStatus)

    if (window.__fangstPlotStatus) {
      setStatus(window.__fangstPlotStatus)
    }

    return () => {
      window.removeEventListener('status-update', handleStatus)
    }
  }, [])

  return (
    <StatusMessage
      message={status.message}
      type={status.type}
    />
  )
}

export default App