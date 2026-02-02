import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyFunds } from '../context/MyFundsContext'
import EditFundDialog from './EditFundDialog'

function FundItem({ fund }) {
  const navigate = useNavigate()
  const {
    removeFund,
    calculateHoldingValue,
    calculateProfit,
    calculateProfitRate
  } = useMyFunds()

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [todayEstimateProfit, setTodayEstimateProfit] = useState(null)

  const holdingValue = calculateHoldingValue(fund)
  const profit = calculateProfit(fund)
  const profitRate = calculateProfitRate(fund)
  const formattedProfitRate = Math.round(profitRate * 100) / 100
  const hasTodayEstimate = todayEstimateProfit !== null && todayEstimateProfit !== undefined

  useEffect(() => {
    setTodayEstimateProfit(fund.today_estimate_profit)
  }, [fund.today_estimate_profit])

  const handleViewDetail = () => {
    navigate(`/fund/${fund.code}`)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setShowEditDialog(true)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm(`确定要删除基金 ${fund.name} 吗？`)) {
      removeFund(fund.id)
    }
  }

  const handleEditSuccess = (updates) => {
    setShowEditDialog(false)
  }

  const formatTodayEstimateProfit = (profit) => {
    if (profit == null) return '-'
    
    return `${profit >= 0 ? '+' : '-'}¥${Math.abs(profit).toFixed(2)}`
  }

  return (
    <>
      <div className="fund-item" onClick={handleViewDetail}>
        <div className="fund-item-main">
          <div className="fund-item-left">
            <div className="fund-item-name">{fund.name} ({fund.code})</div>
            <div className="fund-item-info">
              <div className="fund-item-info-item">
                <div className="fund-item-info-label">风险等级</div>
                <div className="fund-item-info-value">{fund.risk_level || '-'}</div>
              </div>
              <div className="fund-item-info-item">
                <div className="fund-item-info-label">基金类型</div>
                <div className="fund-item-info-value">{fund.type || '-'}</div>
              </div>
              <div className="fund-item-info-item">
                <div className="fund-item-info-label">持仓金额</div>
                <div className="fund-item-info-value">¥{fund.holding?.holding_amount.toFixed(2)}</div>
              </div>
              <div className="fund-item-info-item">
                <div className="fund-item-info-label">当前收益</div>
                <div className={`fund-item-info-value ${profit >= 0 ? 'positive' : 'negative'}`}>
                  {profit >= 0 ? '+' : ''}¥{Math.abs(profit).toFixed(2)}
                </div>
              </div>
              <div className="fund-item-info-item">
                <div className="fund-item-info-label">收益率</div>
                <div className={`fund-item-info-value ${formattedProfitRate >= 0 ? 'positive' : 'negative'}`}>
                  {formattedProfitRate >= 0 ? '+' : ''}{formattedProfitRate.toFixed(2)}%
                </div>
              </div>
              <div className="fund-item-info-item">
                <div className="fund-item-info-label">实时估值</div>
                <div className="fund-item-info-value">
                  {fund.fund_info?.current_value ? `¥${fund.fund_info.current_value.toFixed(2)}` : '-'}
                </div>
              </div>
              <div className="fund-item-info-item">
                <div className="fund-item-info-label">当日收益</div>
                <div className={`fund-item-info-value ${hasTodayEstimate ? (todayEstimateProfit >= 0 ? 'positive' : 'negative') : ''}`}>
                  {formatTodayEstimateProfit(todayEstimateProfit)}
                </div>
              </div>
            </div>
          </div>
          <div className="fund-item-right">
            <div className="fund-item-actions">
              <button className="fund-item-btn edit" onClick={handleEdit}>
                编辑
              </button>
              <button className="fund-item-btn delete" onClick={handleDelete}>
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditFundDialog
        fund={fund}
        visible={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}

export default FundItem
