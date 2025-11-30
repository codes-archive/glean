import axios from 'axios'

const api = axios.create({
  baseURL: '/api/admin',
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const storedAuth = localStorage.getItem('glean-admin-auth')
    if (storedAuth) {
      try {
        const { state } = JSON.parse(storedAuth)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.error('Failed to parse stored auth:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

