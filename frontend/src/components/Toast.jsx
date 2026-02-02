import { useEffect, useState } from 'react'
import './Toast.css'

function Toast({ visible, message, type = 'info', onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="toast-overlay" onClick={onClose}>
      <div className={`toast toast-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="toast-icon">
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  )
}

export function useToast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')

  const showToast = (msg, toastType = 'info') => {
    setMessage(msg)
    setType(toastType)
    setVisible(true)
  }

  const hideToast = () => {
    setVisible(false)
    setMessage('')
  }

  return {
    Toast: () => <Toast visible={visible} message={message} type={type} onClose={hideToast} />,
    showToast,
    hideToast
  }
}

export default Toast