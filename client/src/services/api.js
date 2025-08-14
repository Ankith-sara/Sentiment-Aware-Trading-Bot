import axios from 'axios'
import useAuthStore from '../stores/authstore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
})

// Request interceptor to add auth header
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
}

export const tradingApi = {
  getPortfolio: () => apiClient.get('/trading/portfolio'),
  getTrades: () => apiClient.get('/trading/trades'),
  getWatchlist: () => apiClient.get('/trading/watchlist'),
  addToWatchlist: (symbol) => apiClient.post('/trading/watchlist', { symbol }),
}

export const sentimentApi = {
  getLatestSentiment: (symbol) => apiClient.get(`/sentiment/latest/${symbol}`),
  getSentimentHistory: (symbol) => apiClient.get(`/sentiment/history/${symbol}`),
}

export default apiClient