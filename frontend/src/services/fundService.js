import api from './api'

export const fundService = {
  searchFunds: async (keyword, limit = 20) => {
    return api.get('/funds/search', { params: { keyword, limit } })
  },
  
  getFundDetail: async (fundCode) => {
    return api.get(`/funds/${fundCode}/detail`)
  },
  
  getFundEstimate: async (fundCode) => {
    return api.get(`/funds/${fundCode}/estimate`)
  },
  
  getFundHistory: async (fundCode, startDate, endDate) => {
    return api.get(`/funds/${fundCode}/history`, { params: { startDate, endDate } })
  },
  
  getFundHoldings: async (fundCode) => {
    console.log(`[DEBUG] Calling getFundHoldings for ${fundCode}`);
    const result = await api.get(`/funds/${fundCode}/holdings`);
    console.log(`[DEBUG] getFundHoldings returned:`, result);
    console.log(`[DEBUG] getFundHoldings type:`, typeof result);
    console.log(`[DEBUG] getFundHoldings is array:`, Array.isArray(result));
    console.log(`[DEBUG] getFundHoldings length:`, result?.length);
    return result;
  },
  
  getFundManagers: async (fundCode) => {
    return api.get(`/funds/${fundCode}/managers`)
  }
}

export const { searchFunds, getFundDetail, getFundEstimate, getFundHistory, getFundHoldings, getFundManagers } = fundService

export const dataSourceService = {
  getAvailableSources: async () => {
    return api.get('/data_sources')
  },
  
  getCurrentSource: async () => {
    return api.get('/data_sources/current')
  },
  
  setDataSource: async (sourceName) => {
    return api.post(`/data_sources/set/${sourceName}`)
  }
}