import { useState, useEffect } from 'react'
import { useMyFunds } from '../context/MyFundsContext'
import './EditFundDialog.css'

function EditFundDialog({ fund, visible, onClose, onSuccess }) {
  const { updateFund } = useMyFunds()

  const [holdingAmount, setHoldingAmount] = useState('')
  const [currentProfit, setCurrentProfit] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (visible && fund) {
      setHoldingAmount(fund.holding?.holding_amount?.toString() || '')
      setCurrentProfit(fund.holding?.current_profit?.toString() || '')
      setNotes(fund.holding?.notes || '')
    }
  }, [visible, fund])

  const handleSubmit = () => {
    if (!holdingAmount) {
      alert('请填写持仓金额')
      return
    }

    if (parseFloat(holdingAmount) <= 0) {
      alert('持仓金额必须大于0')
      return
    }

    if (currentProfit !== '' && parseFloat(currentProfit) < -parseFloat(holdingAmount)) {
      alert('当前收益不能小于负的持仓金额')
      return
    }

    const updates = {
      holding: {
        holding_amount: parseFloat(holdingAmount),
        current_profit: currentProfit !== '' ? parseFloat(currentProfit) : 0,
        notes: notes.trim()
      }
    }

    updateFund(fund.id, updates)
    onSuccess(updates)
    onClose()
  }

  if (!visible) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>编辑基金持仓</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="fund-preview">
            <div className="fund-name">{fund.name}</div>
            <div className="fund-code">{fund.code}</div>
          </div>

          <div className="form-group">
            <label>持仓金额 (¥)</label>
            <input
              type="number"
              step="0.01"
              value={holdingAmount}
              onChange={(e) => setHoldingAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>当前收益 (¥) (可选)</label>
            <input
              type="number"
              step="0.01"
              value={currentProfit}
              onChange={(e) => setCurrentProfit(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>备注 (可选)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            取消
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={!fund}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditFundDialog
