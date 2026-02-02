import { useEffect } from 'react'
import './SuccessNotification.css'

function SuccessNotification({ message, visible, onClose }) {
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
    <div className="success-notification-overlay" onClick={onClose}>
      <div className="success-notification-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">✓</div>
        <h2 className="success-title">操作成功</h2>
        <p className="success-message">{message}</p>
        <button className="success-button" onClick={onClose}>
          确定
        </button>
      </div>
    </div>
  )
}

export default SuccessNotification
