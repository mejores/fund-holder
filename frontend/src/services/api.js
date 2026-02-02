import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

api.interceptors.request.use(
  (config) => {
    console.log(`[REQUEST] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`)
    console.log('[REQUEST HEADERS]', config.headers)
    return config
  },
  (error) => {
    console.error('[REQUEST ERROR]:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log(`[RESPONSE] ${response.config.method.toUpperCase()} ${response.config.baseURL}${response.config.url} - ${response.status}`)
    if (response.config.url && response.config.url.includes('funds') && response.config.url.includes('holdings')) {
      console.log(`[DEBUG] Holdings API response data:`, response.data)
      console.log(`[DEBUG] Holdings data type:`, typeof response.data)
      console.log(`[DEBUG] Holdings is array:`, Array.isArray(response.data))
      console.log(`[DEBUG] Holdings length:`, response.data?.length)
      console.log(`[DEBUG] Holdings keys:`, Object.keys(response.data))
      console.log(`[DEBUG] Full response object:`, response)
    }
    return response.data
  },
  (error) => {
    console.error('[RESPONSE ERROR]:', error)
    console.error('[RESPONSE ERROR details]:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    })
    return Promise.reject(error)
  }
)

export default api