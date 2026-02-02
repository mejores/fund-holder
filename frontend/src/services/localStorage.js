const STORAGE_KEY = 'fund-holder-my-funds'

export const myFundsStorage = {
  getAll: (userId = null) => {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return { myFunds: [], version: '1.0' }
    
    try {
      const parsed = JSON.parse(data)
      if (userId) {
        return { myFunds: parsed[userId] || [], version: '1.0' }
      }
      return parsed
    } catch (error) {
      console.error('Failed to parse stored data:', error)
      return { myFunds: [], version: '1.0' }
    }
  },

  save: (funds, userId = null) => {
    let allData = {}
    const existingData = localStorage.getItem(STORAGE_KEY)
    if (existingData) {
      try {
        allData = JSON.parse(existingData)
      } catch (error) {
        allData = {}
      }
    }

    if (userId) {
      allData[userId] = funds
    } else {
      allData = funds
    }

    const data = {
      ...allData,
      version: '1.0',
      lastSync: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },

  clear: (userId = null) => {
    if (userId) {
      const allData = myFundsStorage.getAll()
      delete allData[userId]
      myFundsStorage.save(allData)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  addFund: (fund, userId = null) => {
    const data = myFundsStorage.getAll(userId)
    const newFund = {
      ...fund,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    data.myFunds.push(newFund)
    myFundsStorage.save(data.myFunds, userId)
    return newFund
  },

  updateFund: (id, updates, userId = null) => {
    const data = myFundsStorage.getAll(userId)
    const fundIndex = data.myFunds.findIndex(fund => fund.id === id)
    if (fundIndex !== -1) {
      data.myFunds[fundIndex] = {
        ...data.myFunds[fundIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      myFundsStorage.save(data.myFunds, userId)
      return data.myFunds[fundIndex]
    }
    return null
  },

  removeFund: (id, userId = null) => {
    const data = myFundsStorage.getAll(userId)
    data.myFunds = data.myFunds.filter(fund => fund.id !== id)
    myFundsStorage.save(data.myFunds, userId)
  },

  getFundById: (id, userId = null) => {
    const data = myFundsStorage.getAll(userId)
    return data.myFunds.find(fund => fund.id === id)
  }
}
