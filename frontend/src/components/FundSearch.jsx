import React, { useState, useEffect } from 'react'
import { fundService } from '../services/fundService'
import './FundSearch.css'
import { useNavigate } from 'react-router-dom'

const FundSearch = () => {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!keyword.trim()) return
    
    setLoading(true)
    try {
      const data = await fundService.searchFunds(keyword.trim())
      setResults(data)
    } catch (error) {
      console.error('搜索失败:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleFundClick = (fundCode) => {
    navigate(`/fund/${fundCode}`)
  }

  return (
    <div className="fund-search">
      <div className="search-box">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入基金代码或名称..."
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="search-results">
          <h3>搜索结果 ({results.length})</h3>
          <ul>
            {results.map((fund) => (
              <li key={fund.code} onClick={() => handleFundClick(fund.code)}>
                <div className="fund-info">
                  <strong>{fund.name}</strong>
                  <span className="fund-code">({fund.code})</span>
                </div>
                <div className="fund-details">
                  {fund.full_name && <span>{fund.full_name}</span>}
                  {fund.type && <span>{fund.type}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {results.length === 0 && keyword && !loading && (
        <div className="no-results">
          没有找到相关基金
        </div>
      )}
    </div>
  )
}

export default FundSearch