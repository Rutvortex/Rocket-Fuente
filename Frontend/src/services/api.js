import axios from 'axios'
import { getApiUrl } from '../utils/AutoConfiguracion'

const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const pendingRequests = new Map()

const buildRequestKey = ({ method, url, params, data }) => {
  const paramsKey = params ? JSON.stringify(params) : ''
  const dataKey = data ? JSON.stringify(data) : ''
  return `${method}:${url}:${paramsKey}:${dataKey}`
}

const dedupeRequest = (config, requestFn) => {
  const key = buildRequestKey(config)
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, promise)
  return promise
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

api.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  const session = localStorage.getItem('session')
  if (session) {
    try {
      const sessionData = JSON.parse(session)
      if (sessionData?.token) {
        config.headers.Authorization = `Bearer ${sessionData.token}`
      }
    } catch (error) {
      console.error('Error parsing session data:', error)
    }
  }

  if (import.meta.env.DEV && !config.headers.Authorization) {
    console.debug('[api] request missing Authorization token for', config.url)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || !error.response) {
      return Promise.reject(error)
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const session = localStorage.getItem('session')
      if (session) {
        try {
          const { refreshToken, user } = JSON.parse(session)
          if (refreshToken && !originalRequest.url.includes('/auth/refresh')) {
            const refreshResponse = await api.post('/auth/refresh', { refreshToken })
            const newToken = refreshResponse.data.data.token
            const newRefreshToken = refreshResponse.data.data.refreshToken
            const newSession = { user, token: newToken, refreshToken: newRefreshToken }
            localStorage.setItem('session', JSON.stringify(newSession))
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          localStorage.removeItem('session')
          window.location.href = '/create-account'
          return Promise.reject(error)
        }
      }

      localStorage.removeItem('session')
      window.location.href = '/create-account'
    }

    if (error.response.status === 429) {
      const retryAfterHeader = Number(error.response.headers['retry-after'])
      const retryCount = originalRequest._retryCount || 0
      if (retryCount < 2) {
        originalRequest._retryCount = retryCount + 1
        const delayMs = (retryAfterHeader > 0 ? retryAfterHeader * 1000 : 500) * originalRequest._retryCount
        await sleep(delayMs)
        return api(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

const unwrap = (response) => response.data

export const apiService = {
  // Posts
  getPosts: () => api.get('/posts').then(unwrap),
  getUserPosts: (params) => api.get('/posts', { params }).then(unwrap),
  createPost: (data) => api.post('/posts', data).then(unwrap),
  updatePost: (id, data) => api.put(`/posts/${id}`, data).then(unwrap),
  deletePost: (id) => api.delete(`/posts/${id}`).then(unwrap),
  likePost: (id) => api.post(`/posts/${id}/like`).then(unwrap),

  // Achievements
  getAchievements: () => api.get('/achievements').then(unwrap),
  getUserAchievements: (userId) => api.get(`/achievements/user/${userId}`).then(unwrap),
  getUserAchievementStats: (userId) => api.get(`/achievements/stats/${userId}`).then(unwrap),

  // Users
  getUser: (id) => api.get(`/users/${id}`).then(unwrap),
  updateUser: (id, data) => api.put(`/users/${id}`, data).then(unwrap),
  getProfile: () => api.get('/users/profile').then(unwrap),
  updateProfile: (data) => api.put('/users/profile', data).then(unwrap),

  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }).then(unwrap),
  register: (data) => api.post('/auth/register', data).then(unwrap),
  logout: () => api.post('/auth/logout').then(unwrap),
  changePassword: (data) => api.post('/auth/change-password', data).then(unwrap),

  // Messages
  getMessages: (userId) => api.get(`/messages/${userId}`).then(unwrap),
  sendMessage: (data) => api.post('/messages', data).then(unwrap),

  // Groups
  getGroups: (joined = false) => api.get(joined ? '/groups?joined=true' : '/groups').then(unwrap),
  createGroup: (data) => api.post('/groups', data).then(unwrap),
  joinGroup: (id) => api.post(`/groups/${id}/join`).then(unwrap),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`).then(unwrap),
  getGroupMessages: (groupId) => api.get(`/groups/${groupId}/messages`).then(unwrap),
  sendGroupMessage: (groupId, data) => api.post(`/groups/${groupId}/messages`, data).then(unwrap),

  // Comments
  getComments: (postId) => api.get(`/posts/${postId}/comments`).then(unwrap),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data).then(unwrap),

  // Media
  uploadMedia: (formData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(unwrap),
  getVideos: () => dedupeRequest({ method: 'GET', url: '/media' }, () => api.get('/media').then(unwrap)),
  getMedia: (id) => dedupeRequest({ method: 'GET', url: `/media/${id}` }, () => api.get(`/media/${id}`).then(unwrap)),
  createMediaComment: (id, data) => api.post(`/media/${id}/comment`, data).then(unwrap),
  rateMedia: (id, data) => api.put(`/media/${id}/rate`, data).then(unwrap),
}

export default api
