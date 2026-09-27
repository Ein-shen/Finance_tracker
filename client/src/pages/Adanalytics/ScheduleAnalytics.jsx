import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { auth } from '../../firebase'
import { API_URL } from '../../api'

const CACHE_KEY_PREFIX = 'scheduleAnalytics_'

export const ScheduleAnalytics = () => {

  const getCacheKey = (uid) => `${CACHE_KEY_PREFIX}${uid}`

  const saveCache = (uid, data) => {
    try {
      if (uid) localStorage.setItem(getCacheKey(uid), JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save schedule analytics cache:', error)
    }
  }

  // Peek at any cached copy so something shows before auth resolves
  const [cachedAnalytics] = useState(() => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_KEY_PREFIX))
      if (keys.length === 0) return null
      const cached = localStorage.getItem(keys[0])
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  //Analytics
  const [loadingAnalytics, setLoadingAnalytics] = useState(cachedAnalytics === null)
  const [analytics, setAnalytics] = useState(cachedAnalytics)

  //Auth
  const [authLoading, setAuthLoading] = useState(true)

  // ------------------------------------------
  // Direct API Fetcher Method
  // ------------------------------------------
  const fetchAnalyticsData = async () => {
    const user = auth.currentUser

    if (!user) {
      throw new Error('You must be logged in first')
    }

    const token = await user.getIdToken()

    const response = await fetch(`${API_URL}/api/admin/analytics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

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

  // ------------------------------------------
  // Firebase Auth Listener & Fetch Trigger
  // ------------------------------------------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // Load this specific user's cache first (in case device is shared)
      if (user) {
        try {
          const cached = localStorage.getItem(getCacheKey(user.uid))
          if (cached) {
            setAnalytics(JSON.parse(cached))
            setLoadingAnalytics(false)
          }
        } catch (error) {
          console.error('Failed to read schedule analytics cache:', error)
        }
      }

      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const getAnalytics = async () => {
    try {
      const user = auth.currentUser

      if (!user) {
        setAnalytics(null)
        setLoadingAnalytics(false)
        return
      }

      // Only block the UI with a loading state if nothing is on screen yet
      setLoadingAnalytics((prev) => (analytics ? false : prev))

      const data = await fetchAnalyticsData()
      setAnalytics(data)
      saveCache(user.uid, data)
    } catch (error) {
      console.error('Get analytics error:', error)
      // If cached data is already showing, fail quietly instead of alerting
      if (!analytics) {
        alert(error.message || 'Failed to get analytics')
      }
    } finally {
      setLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      getAnalytics()
    }
  }, [authLoading])

  if (authLoading) {
    return (
      <div className="w-full md:pt-0">
        <p className="theme-text font-mono px-4 sm:px-8 md:px-12 lg:px-20">
          Checking login...
        </p>
      </div>
    )
  }

  // ======================================
  // SCHEDULE (ALL USERS)
  // ======================================
  return (
    <div>
      <h2 className="font-mono text-xl theme-text mb-4">
        All Schedule
      </h2>

      {loadingAnalytics && (
        <p className="theme-text font-mono">Loading analytics...</p>
      )}

      {!loadingAnalytics && !analytics && (
        <p className="theme-text font-mono">No analytics data yet.</p>
      )}

      {!loadingAnalytics && analytics && (
        <div className="flex flex-col gap-10 pt-10">

          {/* Inline Summary Cards: Schedule */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="theme-card theme-border border-2 rounded-md p-4 flex-1">
              <p className="theme-text font-mono text-sm opacity-70 text-center">Upcoming Bills</p>
              <p className="theme-text font-mono text-2xl font-bold text-center">₱{analytics.totalUpcoming}</p>
            </div>
          </div>

          {/* Inline Chart: Schedule */}
          <div className="mt-6">
            {!analytics.upcomingByCategory || analytics.upcomingByCategory.length === 0 ? (
              <div className="theme-text font-mono">No category data yet.</div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.upcomingByCategory}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#b666f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}