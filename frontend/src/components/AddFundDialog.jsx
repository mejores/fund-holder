import { useState, useEffect } from 'react'
import { useMyFunds } from '../context/MyFundsContext'
import { searchFunds } from '../services/fundService'
import './AddFundDialog.css'

function AddFundDialog({ visible, onClose }) {
  const { addFund } = useMyFunds()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFund, setSelectedFund] = useState(null)
  const [holdingAmount, setHoldingAmount] = useState('')
  const [currentProfit, setCurrentProfit] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (visible) {
      resetForm()
    }
  }, [visible])

  const resetForm = () => {
    setSearchKeyword('')
    setSearchResults([])
    setIsSearching(false)
    setSelectedFund(null)
    setHoldingAmount('')
    setCurrentProfit('')
    setNotes('')
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      return
    }

    setIsSearching(true)
    try {
      const results = await searchFunds(searchKeyword)
      setSearchResults(results)
    } catch (error) {
      console.error('Search funds failed:', error)
      alert('搜索失败，请稍后重试')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectFund = (fund) => {
    setSelectedFund(fund)
    setHoldingAmount('')
    setCurrentProfit('')
    setNotes('')
  }

  const handleSubmit = () => {
    if (!selectedFund) {
      alert('请先选择要添加的基金')
      return
    }

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

    const fundData = {
      code: selectedFund.code,
      name: selectedFund.name,
      full_name: selectedFund.full_name,
      type: selectedFund.type,
      holding: {
        holding_amount: parseFloat(holdingAmount),
        current_profit: currentProfit !== '' ? parseFloat(currentProfit) : 0,
        notes: notes.trim()
      }
    }

    addFund(fundData)
    onClose()
    resetForm()
  }

  if (!visible) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>添加基金</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="输入基金代码或名称搜索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn-search" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? '搜索中...' : '🔍 搜索'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(fund => (
                  <div
                    key={fund.code}
                    className={`fund-item ${selectedFund?.code === fund.code ? 'selected' : ''}`}
                    onClick={() => handleSelectFund(fund)}
                  >
                    <div className="fund-info">
                      <div className="fund-name">{fund.name}</div>
                      <div className="fund-code">{fund.code}</div>
                    </div>
                    <div className="fund-type">{fund.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFund && (
            <div className="holding-section">
              <div className="fund-preview">
                <div className="fund-name">{selectedFund.name}</div>
                <div className="fund-code">{selectedFund.code}</div>
              </div>

              <div className="form-group">
                <label>持仓金额 (¥)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="请输入持仓金额"
                  value={holdingAmount}
                  onChange={(e) => setHoldingAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>当前收益 (¥) (可选)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="请输入当前收益，正值为盈利，负值为亏损"
                  value={currentProfit}
                  onChange={(e) => setCurrentProfit(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>备注 (可选)</label>
                <textarea
                  placeholder="添加备注信息..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            取消
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={!selectedFund}>
            添加基金
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddFundDialog
