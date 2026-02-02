import { useState, useEffect } from 'react'
import { useMyFunds } from '../context/MyFundsContext'
import { searchFunds } from '../services/fundService'
import { useToast } from './Toast'
import './BatchAddFundDialog.css'

function BatchAddFundDialog({ visible, onClose }) {
  const { addFund, myFunds } = useMyFunds()
  const { Toast, showToast } = useToast()

  const [inputText, setInputText] = useState('')
  const [parsedFunds, setParsedFunds] = useState([])
  const [isParsing, setIsParsing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState('skip')
  const [defaultHoldingAmount, setDefaultHoldingAmount] = useState('')
  const [defaultCurrentProfit, setDefaultCurrentProfit] = useState('')

  useEffect(() => {
    if (visible) {
      resetForm()
    }
  }, [visible])

  const resetForm = () => {
    setInputText('')
    setParsedFunds([])
    setIsParsing(false)
    setIsAdding(false)
    setProgress(0)
    setMode('skip')
    setDefaultHoldingAmount('')
    setDefaultCurrentProfit('')
  }

  const parseFunds = async () => {
    if (!inputText.trim()) {
      showToast('请输入基金代码列表', 'warning')
      return
    }

    setIsParsing(true)
    setProgress(0)

    try {
      const fundCodes = parseInputText(inputText)
      const uniqueCodes = [...new Set(fundCodes)]
      const newFunds = []

      for (let i = 0; i < uniqueCodes.length; i++) {
        const code = uniqueCodes[i]
        const isDuplicate = myFunds.some(f => f.code === code)

        if (isDuplicate) {
          newFunds.push({
            code,
            name: '已添加',
            status: 'duplicate',
            reason: '基金已在持仓中'
          })
        } else {
          try {
            const results = await searchFunds(code, 1)
            if (results.length > 0) {
              newFunds.push({
                code: results[0].code,
                name: results[0].name,
                full_name: results[0].full_name,
                type: results[0].type,
                status: 'ready',
                holding_amount: '',
                current_profit: '',
                notes: ''
              })
            } else {
              newFunds.push({
                code,
                name: '未知基金',
                status: 'not_found',
                reason: '未找到该基金'
              })
            }
          } catch (error) {
            newFunds.push({
              code,
              name: '未知基金',
              status: 'error',
              reason: '搜索失败'
            })
          }
        }

        setProgress(Math.round(((i + 1) / uniqueCodes.length) * 100))
      }

      setParsedFunds(newFunds)
    } catch (error) {
      console.error('解析基金失败:', error)
      showToast('解析基金失败，请检查输入格式', 'error')
    } finally {
      setIsParsing(false)
    }
  }

  const parseInputText = (text) => {
    return text
      .split(/[\n,，;\t ]+/)
      .map(s => s.trim())
      .filter(s => s.length === 6 && /^\d+$/.test(s))
  }

  const updateFundHolding = (index, field, value) => {
    const newFunds = [...parsedFunds]
    if (newFunds[index]?.status === 'ready') {
      newFunds[index][field] = value
      setParsedFunds(newFunds)
    }
  }

  const startAdding = async () => {
    if (parsedFunds.length === 0) {
      showToast('没有可添加的基金', 'warning')
      return
    }

    const readyFunds = parsedFunds.filter(f => f.status === 'ready')
    if (readyFunds.length === 0) {
      showToast('没有新基金可以添加', 'warning')
      return
    }

    setIsAdding(true)
    setProgress(0)

    let addedCount = 0
    let failedCount = 0

    try {
      for (let i = 0; i < readyFunds.length; i++) {
        const fund = readyFunds[i]

        const holdingAmount = mode === 'default'
          ? parseFloat(defaultHoldingAmount) || 0
          : parseFloat(fund.holding_amount) || 0

        const currentProfit = mode === 'default'
          ? parseFloat(defaultCurrentProfit) || 0
          : parseFloat(fund.current_profit) || 0

        try {
          await addFund({
            code: fund.code,
            name: fund.name,
            full_name: fund.full_name,
            type: fund.type,
            holding_count: 0,
            holding_amount: holdingAmount,
            current_profit: currentProfit
          })
          addedCount++
        } catch (addError) {
          console.error(`添加基金 ${fund.code} 失败:`, addError)
          failedCount++
        }

        setProgress(Math.round(((i + 1) / readyFunds.length) * 100))
      }

      // 显示添加结果
      let message = ''
      if (addedCount > 0) {
        message += `成功添加 ${addedCount} 只基金！`
        if (mode === 'skip') {
          message += '请在"我的基金"页面逐个编辑补全持仓信息。'
        }
      }
      if (failedCount > 0) {
        message += `${message ? ' ' : ''}有 ${failedCount} 只基金添加失败。`
      }
      showToast(message || '没有添加任何基金', addedCount > 0 ? 'success' : 'info')

      onClose()
    } catch (error) {
      console.error('批量添加失败:', error)
      showToast(`批量添加过程出错！已成功添加 ${addedCount} 只基金，失败 ${failedCount} 只基金。`, 'error')
    } finally {
      setIsAdding(false)
    }
  }

  const countByStatus = (status) => {
    return parsedFunds.filter(f => f.status === status).length
  }

  if (!visible) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📦 批量添加基金</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="input-section">
            <h3>第一步：输入基金代码列表</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入基金代码列表，支持以下格式：&#10;- 每行一个基金代码（如：161725）&#10;- 用逗号、空格或制表符分隔&#10;- 支持格式：基金代码 空格 持仓金额（如：161725 1000）&#10;&#10;示例：&#10;161725&#10;159995&#10;515050 5000&#10;164205"
              rows="8"
              disabled={isParsing || isAdding}
            />
            <div className="input-hint">
              💡 提示：支持复制粘贴，会自动解析和去重
            </div>
            <button
              className="btn-primary"
              onClick={parseFunds}
              disabled={isParsing || isAdding || !inputText.trim()}
            >
              {isParsing ? '解析中...' : '解析基金列表'}
            </button>
          </div>

          {parsedFunds.length > 0 && (
            <div className="preview-section">
              <h3>
                第二步：预览基金列表 ({parsedFunds.length} 只)
                <span className="preview-stats">
                  可添加: {countByStatus('ready')} | 
                  已存在: {countByStatus('duplicate')} | 
                  未找到: {countByStatus('not_found')} | 
                  错误: {countByStatus('error')}
                </span>
              </h3>

              <div className="preview-list">
                {parsedFunds.map((fund, index) => (
                  <div key={fund.code} className={`preview-item ${fund.status}`}>
                    <div className="fund-info">
                      <div className="fund-code">{fund.code}</div>
                      <div className="fund-name">{fund.name}</div>
                      {fund.status === 'duplicate' && <div className="status-tag duplicate">已添加</div>}
                      {fund.status === 'not_found' && <div className="status-tag not_found">未找到</div>}
                      {fund.status === 'error' && <div className="status-tag error">错误</div>}
                      {fund.status === 'ready' && <div className="status-tag ready">待添加</div>}
                    </div>

                    {fund.status === 'ready' && mode === 'individual' && (
                      <div className="holding-inputs">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="持仓金额"
                          value={fund.holding_amount}
                          onChange={(e) => updateFundHolding(index, 'holding_amount', e.target.value)}
                          disabled={isAdding}
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="当前收益"
                          value={fund.current_profit}
                          onChange={(e) => updateFundHolding(index, 'current_profit', e.target.value)}
                          disabled={isAdding}
                        />
                      </div>
                    )}

                    {fund.status !== 'ready' && (
                      <div className="reason">{fund.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {countByStatus('ready') > 0 && (
            <div className="settings-section">
              <h3>第三步：设置持仓信息</h3>

              <div className="mode-selector">
                <label>
                  <input
                    type="radio"
                    value="skip"
                    checked={mode === 'skip'}
                    onChange={(e) => setMode(e.target.value)}
                    disabled={isAdding}
                  />
                  <span>跳过持仓信息（后续编辑补全）</span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="default"
                    checked={mode === 'default'}
                    onChange={(e) => setMode(e.target.value)}
                    disabled={isAdding}
                  />
                  <span>使用默认持仓信息</span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="individual"
                    checked={mode === 'individual'}
                    onChange={(e) => setMode(e.target.value)}
                    disabled={isAdding}
                  />
                  <span>单独为每个基金设置</span>
                </label>
              </div>

              {mode === 'default' && (
                <div className="default-settings">
                  <div className="form-group">
                    <label>默认持仓金额 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={defaultHoldingAmount}
                      onChange={(e) => setDefaultHoldingAmount(e.target.value)}
                      disabled={isAdding}
                    />
                  </div>
                  <div className="form-group">
                    <label>默认当前收益 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={defaultCurrentProfit}
                      onChange={(e) => setDefaultCurrentProfit(e.target.value)}
                      disabled={isAdding}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {(isParsing || isAdding) && (
            <div className="progress-section">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-text">
                {isParsing ? '正在解析基金列表...' : '正在添加基金...'} {progress}%
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isAdding}>
            取消
          </button>
          {countByStatus('ready') > 0 && (
            <button
              className="btn-primary"
              onClick={startAdding}
              disabled={isAdding || isParsing}
            >
              {isAdding ? '添加中...' : '开始添加'}
            </button>
          )}
        </div>
      </div>
      <Toast />
    </div>
  )
}

export default BatchAddFundDialog
