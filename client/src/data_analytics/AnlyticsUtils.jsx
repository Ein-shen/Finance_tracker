import { auth } from '../firebase'
import { API_URL } from '../api'

export const fetchAnalytics = async () => {
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

  return data
}