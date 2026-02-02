import { useState, useEffect } from 'react'
import { useMyFunds } from '../context/MyFundsContext'
import FundItem from './FundItem'
import AddFundDialog from './AddFundDialog'
import BatchAddFundDialog from './BatchAddFundDialog'
import './MyFunds.css'

function MyFunds() {
  const {
    myFunds,
    isLoading,
    refreshFundValues,
    calculateTotalProfit,
    calculateTotalProfitRate,
    calculateTotalTodayEstimateProfit,
    getFundsWithInfo
  } = useMyFunds()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showBatchAddDialog, setShowBatchAddDialog] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [fundsWithInfo, setFundsWithInfo] = useState([])
  const [isInfoLoading, setIsInfoLoading] = useState(false)

  const filteredFunds = fundsWithInfo.filter(fund =>
    fund.name.includes(searchKeyword) || fund.code.includes(searchKeyword)
  )

  const totalValue = fundsWithInfo.reduce((total, fund) => {
    const { holding_amount = 0 } = fund.holding || {}
    return total + holding_amount
  }, 0)
  const totalProfit = calculateTotalProfit()
  const totalProfitRate = calculateTotalProfitRate()
  const formattedTotalProfitRate = Math.round(totalProfitRate * 100) / 100
  const hasValidTodayEstimates = fundsWithInfo.some(fund => fund.today_estimate_profit !== null && fund.today_estimate_profit !== undefined)

  const handleRefresh = () => {
    refreshFundValues()
  }

  const loadFundsInfo = async () => {
    setIsInfoLoading(true)
    try {
      const fundsInfo = await getFundsWithInfo()
      setFundsWithInfo(fundsInfo)
      
      if (fundsInfo.length > 0) {
        const todayProfit = fundsInfo.reduce((total, fund) => {
          return total + (fund.today_estimate_profit || 0)
        }, 0)
        setTotalTodayEstimateProfit(todayProfit)
      }
    } catch (error) {
      console.error('Failed to load funds info:', error)
    } finally {
      setIsInfoLoading(false)
    }
  }

  const [totalTodayEstimateProfit, setTotalTodayEstimateProfit] = useState(0)

  useEffect(() => {
    loadFundsInfo()
  }, [myFunds])

  const formatTodayEstimateProfit = (profit, hasValidData) => {
    if (!hasValidData) return '-'
    return `${profit >= 0 ? '+' : '-'}¥${Math.abs(profit).toFixed(2)}`
  }

  return (
    <div className="my-funds-page">
      <div className="page-header">
        <h1>🎯 我的基金</h1>
        <div className="header-actions">
          <button className="btn-refresh" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? '刷新中...' : '🔄 刷新'}
          </button>
          <button className="btn-add" onClick={() => setShowAddDialog(true)}>
            ➕ 添加基金
          </button>
          <button className="btn-batch-add" onClick={() => setShowBatchAddDialog(true)}>
            📦 批量添加
          </button>
        </div>
      </div>

      <div className="overview-section">
        <div className="overview-card">
          <div className="overview-label">总持仓金额</div>
          <div className="overview-value">
            ¥{totalValue.toFixed(2)}
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-label">总收益</div>
          <div className={`overview-value ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
            {totalProfit >= 0 ? '+' : ''}¥{Math.abs(totalProfit).toFixed(2)}
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-label">总收益率</div>
          <div className={`overview-value ${totalProfitRate >= 0 ? 'positive' : 'negative'}`}>
            {formattedTotalProfitRate >= 0 ? '+' : ''}{formattedTotalProfitRate.toFixed(2)}%
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-label">当日预估总收益</div>
          <div className={`overview-value ${hasValidTodayEstimates ? (totalTodayEstimateProfit >= 0 ? 'positive' : 'negative') : 'placeholder'}`}>
            {formatTodayEstimateProfit(totalTodayEstimateProfit, hasValidTodayEstimates)}
          </div>
        </div>
      </div>

      <div className="funds-section">
        {isInfoLoading ? (
          <div className="loading">加载基金信息中...</div>
        ) : (
          <>
            <div className="funds-header">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="搜索基金名称或代码..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="funds-list">
              {filteredFunds.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">还没有添加基金</div>
                  <div className="empty-subtext">点击"添加基金"按钮开始管理您的基金</div>
                </div>
              ) : (
                filteredFunds.map(fund => (
                  <FundItem key={fund.id} fund={fund} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      <AddFundDialog
        visible={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />

      <BatchAddFundDialog
        visible={showBatchAddDialog}
        onClose={() => setShowBatchAddDialog(false)}
      />
    </div>
  )
}

export default MyFunds
