import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fundService } from '../services/fundService'
import './FundDetail.css'
import ReactECharts from 'echarts-for-react'

const FundDetail = () => {
  const { fundCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [fundData, setFundData] = useState({
    detail: null,
    estimate: null,
    history: null,
    holdings: null,
    managers: null
  })
  const [activeTab, setActiveTab] = useState('history')

  useEffect(() => {
    if (fundCode) {
      loadFundData()
    }
  }, [fundCode])

  const loadFundData = async () => {
    setLoading(true)
    try {
      const [detail, estimate, history, holdings, managers] = await Promise.all([
        fundService.getFundDetail(fundCode),
        fundService.getFundEstimate(fundCode),
        fundService.getFundHistory(fundCode),
        fundService.getFundHoldings(fundCode),
        fundService.getFundManagers(fundCode)
      ])
      
      console.log("=== 调试信息 ===");
      console.log("Fund code:", fundCode);
      console.log("History data:", history);
      console.log("Holdings data:", holdings);
      console.log("Holdings length:", holdings?.length);
      console.log("Holdings type:", typeof holdings);
      console.log("Holdings is array:", Array.isArray(holdings));
      console.log("Holdings keys:", holdings ? Object.keys(holdings) : "undefined");
      
      setFundData({ detail, estimate, history, holdings, managers })
    } catch (error) {
      console.error('加载基金数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-'
    if (num === 0) return '0.00'
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getHistoryChartOption = () => {
    if (!fundData.history || fundData.history.length === 0) return null

    const dates = fundData.history.map(h => h.date).reverse()
    const values = fundData.history.map(h => h.unit_nav).reverse()

    return {
      title: { text: '净值走势图' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{ data: values, type: 'line' }]
    }
  }

  if (loading) {
    return <div className="loading">加载中...</div>
  }

  const { detail, estimate, history, holdings, managers } = fundData

  return (
    <div className="fund-detail">
      {detail && (
        <div className="fund-header">
          <div className="fund-basic-info">
            <h2>{detail.name}</h2>
            <div className="fund-code">{detail.code}</div>
            <div className="fund-full-name">{detail.full_name}</div>
          </div>
          <div className="fund-meta">
            <div className="meta-item">
              <span className="label">基金类型:</span>
              <span className="value">{detail.type}</span>
            </div>
            <div className="meta-item">
              <span className="label">基金经理:</span>
              <span className="value">{detail.manager}</span>
            </div>
            <div className="meta-item">
              <span className="label">成立日期:</span>
              <span className="value">{detail.establish_date}</span>
            </div>
            <div className="meta-item">
              <span className="label">基金规模:</span>
              <span className="value">{detail.scale}</span>
            </div>
          </div>
        </div>
      )}

      {estimate && (
        <div className="fund-estimate">
          <h3>实时估值</h3>
          <div className="estimate-grid">
            <div className="estimate-item">
              <span className="label">估算值</span>
              <span className="value">{formatNumber(estimate.estimate_value)}</span>
            </div>
            <div className={`estimate-item ${estimate.estimate_change >= 0 ? 'positive' : 'negative'}`}>
              <span className="label">估算增长率</span>
              <span className="value">{formatNumber(estimate.estimate_change)}%</span>
            </div>
            <div className="estimate-item">
              <span className="label">昨日净值</span>
              <span className="value">{formatNumber(estimate.yesterday_nav)}</span>
            </div>
            <div className="estimate-item">
              <span className="label">单位净值</span>
              <span className="value">{formatNumber(estimate.unit_nav)}</span>
            </div>
            <div className="estimate-item">
              <span className="label">净值日期</span>
              <span className="value">{estimate.nav_date}</span>
            </div>
            <div className="estimate-item">
              <span className="label">估值时间</span>
              <span className="value">{estimate.estimate_time}</span>
            </div>
          </div>
        </div>
      )}

      {(history && history.length > 0) || (holdings && holdings) ? (
        <div className="fund-tabs-section">
          <div className="fund-tabs">
            {history && history.length > 0 && (
              <div 
                className={`fund-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                历史净值
              </div>
            )}
            {holdings && (
              <div 
                className={`fund-tab ${activeTab === 'holdings' ? 'active' : ''}`}
                onClick={() => setActiveTab('holdings')}
              >
                持仓占比
              </div>
            )}
          </div>

          {activeTab === 'history' && history && history.length > 0 && (
            <div className="fund-tab-content">
              <div className="history-chart">
                <ReactECharts option={getHistoryChartOption()} style={{ height: '300px' }} />
              </div>
              <div className="history-table">
                <table>
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>单位净值</th>
                      <th>累计净值</th>
                      <th>日增长率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 10).map((h, index) => (
                      <tr key={index}>
                        <td>{h.date}</td>
                        <td>{formatNumber(h.unit_nav)}</td>
                        <td>{formatNumber(h.accumulated_nav)}</td>
                        <td className={h.change_pct >= 0 ? 'positive' : 'negative'}>
                          {formatNumber(h.change_pct)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'holdings' && holdings && (
            <div className="fund-tab-content">
              {holdings.length > 0 ? (
                <div className="holdings-table">
                  <table>
                    <thead>
                      <tr>
                        <th>股票代码</th>
                        <th>股票名称</th>
                        <th>占净值比</th>
                        <th>持股数量</th>
                        <th>开盘价</th>
                        <th>收盘价</th>
                        <th>成交量</th>
                        <th>涨幅</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h, index) => (
                        <tr key={index}>
                          <td>{h.stock_code}</td>
                          <td>{h.stock_name}</td>
                          <td>{formatNumber(h.holdings_ratio)}%</td>
                          <td>{formatNumber(h.holdings_count)}</td>
                          <td>{formatNumber(h.open)}</td>
                          <td>{formatNumber(h.close)}</td>
                          <td>{formatNumber(h.volume)}</td>
                          <td className={h.change >= 0 ? 'positive' : 'negative'}>
                            {formatNumber(h.change)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  暂无持仓数据
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {managers && managers.length > 0 && (
        <div className="fund-managers">
          <h3>基金经理</h3>
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>任职日期</th>
                <th>离任日期</th>
                <th>任职期间收益率</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m, index) => (
                <tr key={index}>
                  <td>{m.name}</td>
                  <td>{m.start_date}</td>
                  <td>{m.end_date || '至今'}</td>
                  <td className={m.fund_return >= 0 ? 'positive' : 'negative'}>
                    {formatNumber(m.fund_return)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default FundDetail