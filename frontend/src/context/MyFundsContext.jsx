import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getFundEstimate, getFundDetail } from '../services/fundService'
import api from '../services/api'
import { useToast } from '../components/Toast'

const MyFundsContext = createContext()

function calculateBuyPrice(holdingAmount, currentProfit, currentValue) {
  if (!currentValue || currentValue <= 0 || holdingAmount <= 0) {
    return 0
  }
  const totalCost = holdingAmount - currentProfit
  const shareCount = holdingAmount / currentValue
  return shareCount > 0 ? totalCost / shareCount : 0
}

function calculateShareCount(holdingAmount, currentValue) {
  if (!currentValue || currentValue <= 0 || holdingAmount <= 0) {
    return 0
  }
  return holdingAmount / currentValue
}

export function MyFundsProvider({ children }) {
  const { currentUser, isLoading: authIsLoading } = useAuth()
  const [myFunds, setMyFunds] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fundCache, setFundCache] = useState({})
  const { Toast, showToast } = useToast()

  const loadMyFundsFromBackend = useCallback(async () => {
    try {
      console.log('Loading funds from backend...')
      setIsLoading(true)
      const funds = await api.get('/funds-management/')
      console.log('Loaded funds from backend:', funds)
      const formattedFunds = funds.map(fund => ({
        ...fund,
        holding: {
          holding_amount: fund.holding_amount,
          holding_count: fund.holding_count,
          current_profit: fund.current_profit || 0,
          buy_price: 0,
          notes: ''
        }
      }))
      console.log('Formatted funds:', formattedFunds)
      setMyFunds(formattedFunds)
    } catch (error) {
      console.error('Failed to load funds:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      setMyFunds([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('useEffect triggered, currentUser:', currentUser, 'authIsLoading:', authIsLoading)
    console.log('currentUser:', {
      id: currentUser?.id,
      username: currentUser?.username,
      isAuthenticated: !!currentUser
    })
    if (currentUser) {
      console.log('currentUser exists, loading funds...')
      loadMyFundsFromBackend()
    } else if (!authIsLoading) {
      console.log('currentUser is null and auth not loading, clearing funds')
      setMyFunds([])
    } else {
      console.log('Auth is still loading, waiting...')
    }
  }, [currentUser, loadMyFundsFromBackend, authIsLoading])

  const isFundExists = useCallback((fundCode) => {
    return myFunds.some(fund => fund.code === fundCode)
  }, [myFunds])

  const getFundCache = useCallback(async (fundCode) => {
    if (fundCache[fundCode]) {
      return fundCache[fundCode]
    }
    
    try {
      const detail = await getFundDetail(fundCode)
      const estimate = await getFundEstimate(fundCode)
      
      const fundInfo = {
        name: detail.name || fundCode,
        full_name: detail.full_name || '',
        type: detail.type || '',
        risk_level: detail.rating || detail.risk_level || '',
        current_value: estimate?.estimate_value || 0,
        yesterday_nav: estimate?.yesterday_nav || 0
      }
      
      setFundCache(prev => ({
        ...prev,
        [fundCode]: fundInfo
      }))
      
      return fundInfo
    } catch (error) {
      console.error(`Failed to fetch fund info for ${fundCode}:`, error)
      return {
        name: fundCode,
        full_name: '',
        type: '',
        risk_level: '',
        current_value: 0,
        yesterday_nav: 0
      }
    }
  }, [fundCache])

  const getFundWithInfo = useCallback(async (fund) => {
    if (!fund) {
      return null;
    }

    let fundInfo;
    try {
      fundInfo = await getFundCache(fund.code)
    } catch (error) {
      console.error(`Failed to fetch fund info for ${fund.code}:`, error)
      // 使用基金基本信息作为后备
      fundInfo = {
        name: fund.name || fund.code,
        full_name: '',
        type: '',
        risk_level: '',
        current_value: 0,
        yesterday_nav: 0
      }
    }

    let todayEstimateProfit = null;
    
    if (fundInfo.yesterday_nav > 0 && fund.holding?.holding_count > 0) {
      if (fundInfo.current_value > 0) {
        todayEstimateProfit = (fundInfo.current_value - fundInfo.yesterday_nav) * fund.holding.holding_count;
      }
    } else if (fundInfo.yesterday_nav > 0 && fundInfo.current_value > 0 && fund.holding?.holding_amount > 0) {
      const shareCount = fund.holding.holding_amount / fundInfo.yesterday_nav;
      todayEstimateProfit = (fundInfo.current_value - fundInfo.yesterday_nav) * shareCount;
    } else {
      todayEstimateProfit = null;
    }
    
    return {
      ...fund,
      name: fundInfo.name,
      full_name: fundInfo.full_name,
      type: fundInfo.type,
      risk_level: fundInfo.risk_level,
      current_value: fundInfo.current_value,
      yesterday_nav: fundInfo.yesterday_nav,
      today_estimate_profit: todayEstimateProfit
    }
  }, [getFundCache])

  const getFundsWithInfo = useCallback(async () => {
    console.log('Fetching funds with info for:', myFunds.map(f => `${f.code} (${f.name})`))
    
    const fundsWithInfo = await Promise.all(
      myFunds.map(async (fund) => {
        try {
          return await getFundWithInfo(fund)
        } catch (error) {
          console.error(`Failed to fetch info for fund ${fund.code}:`, error)
          // 返回基本的基金信息
          return {
            ...fund,
            name: fund.name || fund.code,
            full_name: '',
            type: '',
            current_value: 0,
            yesterday_nav: 0,
            today_estimate_profit: null
          }
        }
      })
    )
    
    // 过滤掉 null 值
    const validFunds = fundsWithInfo.filter(fund => fund !== null)
    console.log(`Funds with info loaded: ${validFunds.length}/${myFunds.length}`)
    return validFunds
  }, [myFunds, getFundWithInfo])

  const addFund = useCallback(async (fundData) => {
    try {
      console.log('Adding fund:', fundData)
      
      // 检查基金是否已存在
      if (isFundExists(fundData.code)) {
        showToast(`基金 ${fundData.code} 已存在，请勿重复添加`, 'warning')
        return
      }
      
      const estimate = await getFundEstimate(fundData.code)
      const currentValue = estimate?.estimate_value || 0
      
      // 检查fundData的结构，如果有holding字段，则使用扁平结构
      const hasHolding = fundData.holding
      const { holding_amount, current_profit } = hasHolding ? fundData.holding : fundData
      const holding_count = hasHolding ? calculateShareCount(holding_amount, currentValue) : fundData.holding_count || 0

      await api.post('/funds-management/', {
        code: fundData.code,
        name: fundData.name,
        holding_count: holding_count,
        holding_amount: holding_amount,
        current_profit: current_profit || 0
      })
      
      await loadMyFundsFromBackend()
    } catch (error) {
      console.error('Failed to add fund:', error)
      if (error.response?.status === 400) {
        showToast(error.response?.data?.detail || '基金已存在，请勿重复添加', 'warning')
      } else {
        showToast('添加基金失败，请稍后重试', 'error')
      }
    }
  }, [isFundExists, showToast])

  const updateFund = useCallback(async (id, updates) => {
    try {
      const fundToUpdate = myFunds.find(f => f.id === id)
      if (!fundToUpdate) return
      
      await api.put(`/funds-management/${id}`, {
        code: fundToUpdate.code,
        name: fundToUpdate.name,
        holding_count: updates.holding?.holding_count || fundToUpdate.holding?.holding_count || 0,
        holding_amount: updates.holding?.holding_amount || fundToUpdate.holding?.holding_amount || 0,
        current_profit: updates.holding?.current_profit || fundToUpdate.holding?.current_profit || 0
      })
      
      await loadMyFundsFromBackend()
    } catch (error) {
      console.error('Failed to update fund:', error)
      showToast('更新基金失败，请稍后重试', 'error')
    }
  }, [myFunds, showToast])

  const removeFund = useCallback(async (id) => {
    try {
      await api.delete(`/funds-management/${id}`)
      await loadMyFundsFromBackend()
    } catch (error) {
      console.error('Failed to remove fund:', error)
      showToast('删除基金失败，请稍后重试', 'error')
    }
  }, [showToast])

  const refreshFundValues = useCallback(async () => {
    setIsLoading(true)
    try {
      await loadMyFundsFromBackend()
    } catch (error) {
      console.error('Failed to refresh fund values:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const calculateHoldingValue = useCallback((fund) => {
    const { holding_count = 0, holding_amount = 0 } = fund.holding || {}
    const currentValue = fund.current_value || 0
    const holdingValue = currentValue * holding_count
    return holdingValue
  }, [])

  const calculateProfit = useCallback((fund) => {
    return fund.holding?.current_profit || 0
  }, [])

  const calculateProfitRate = useCallback((fund) => {
    const { holding_amount } = fund.holding || {}
    const cost = holding_amount - fund.holding?.current_profit
    if (!cost || cost <= 0) return 0
    return (fund.holding?.current_profit / cost * 100)
  }, [])

  const calculateTotalValue = useCallback(() => {
    return myFunds.reduce((total, fund) => {
      return total + calculateHoldingValue(fund)
    }, 0)
  }, [myFunds, calculateHoldingValue])

  const calculateTotalProfit = useCallback(() => {
    return myFunds.reduce((total, fund) => {
      return total + calculateProfit(fund)
    }, 0)
  }, [myFunds, calculateProfit])

  const calculateTotalProfitRate = useCallback(() => {
    const totalProfit = calculateTotalProfit()
    const totalCost = myFunds.reduce((total, fund) => {
      const { holding_amount } = fund.holding || {}
      return total + (holding_amount - fund.holding?.current_profit || 0)
    }, 0)
    if (totalCost === 0) return 0
    return (totalProfit / totalCost * 100)
  }, [myFunds, calculateTotalProfit])

  const calculateTotalTodayEstimateProfit = useCallback(async () => {
    const fundsWithInfo = await getFundsWithInfo()
    return fundsWithInfo.reduce((total, fund) => {
      return total + (fund.today_estimate_profit || 0)
    }, 0)
  }, [getFundsWithInfo])

  const calculateTodayEstimateProfit = useCallback(async (fund) => {
    const fundWithInfo = await getFundWithInfo(fund)
    return fundWithInfo.today_estimate_profit
  }, [getFundWithInfo])

  const getFundById = useCallback((id) => {
    return myFunds.find(fund => fund.id === id)
  }, [myFunds])

  return (
    <>
      <MyFundsContext.Provider
        value={{
          myFunds,
          isLoading,
          addFund,
          updateFund,
          removeFund,
          refreshFundValues,
          getFundById,
          getFundsWithInfo,
          calculateHoldingValue,
          calculateProfit,
          calculateProfitRate,
          calculateTotalValue,
          calculateTotalProfit,
          calculateTotalProfitRate,
          calculateTodayEstimateProfit,
          calculateTotalTodayEstimateProfit,
          isFundExists
        }}
      >
        {children}
      </MyFundsContext.Provider>
      <Toast />
    </>
  )
}

export function useMyFunds() {
  const context = useContext(MyFundsContext)
  if (!context) {
    throw new Error('useMyFunds must be used within a MyFundsProvider')
  }
  return context
}
