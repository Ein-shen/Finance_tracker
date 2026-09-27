import { auth } from '../firebase'
import { API_URL } from '../api'

const CACHE_KEY_PREFIX = 'analyticsData_'

// Cache is scoped per user AND per selected month, since the numbers
// shown can differ depending on which month filter is active.
const getCacheKey = (uid, month) => `${CACHE_KEY_PREFIX}${uid}_${month || 'all'}`

const saveCache = (uid, month, data) => {
  try {
    if (uid) localStorage.setItem(getCacheKey(uid, month), JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save analytics cache:', error)
  }
}

// Call this to check if there's cached data for the current user + month,
// so the page can show something instantly before fetchAnalytics() returns.
export const getCachedAnalytics = (month) => {
  try {
    const user = auth.currentUser
    if (!user) return null
    const cached = localStorage.getItem(getCacheKey(user.uid, month))
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Failed to read analytics cache:', error)
    return null
  }
}

export const fetchAnalytics = async (month) => {
  const user = auth.currentUser

  if (!user) {
    throw new Error('You must be logged in first')
  }

  const token = await user.getIdToken()

  const response = await fetch(
    `${API_URL}/api/analytics`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const contentType = response.headers.get('content-type')

  let data = {}

  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    console.error('Server returned non-JSON:', text)
    throw new Error(`Server returned ${response.status} instead of JSON`)
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get analytics')
  }

  // Cache the fresh data, scoped to whichever month was requested
  saveCache(user.uid, month, data)

  return data
}