import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { auth } from '../../firebase'

export const TransactionAnalytics = () => {

  //Analytics
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [analytics, setAnalytics] = useState(null)

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

    const response = await fetch('http://localhost:5000/api/admin/analytics', {
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
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const getAnalytics = async () => {
    try {
      setLoadingAnalytics(true)
      const user = auth.currentUser

      if (!user) {
        setAnalytics(null)
        return
      }

      const data = await fetchAnalyticsData()
      setAnalytics(data)
    } catch (error) {
      console.error('Get analytics error:', error)
      alert(error.message || 'Failed to get analytics')
    } finally {
      setLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      getAnalytics()
    }
  }, [authLoading])

  // ------------------------------------------
  // Render Guard: Auth Loading
  // ------------------------------------------
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
  // TRANSACTIONS (ALL USERS)
  // ======================================
  return (
    <div>
      <h2 className="font-mono text-xl theme-text mb-4">
        All Transactions
      </h2>

      {loadingAnalytics && (
        <p className="theme-text font-mono">Loading analytics...</p>
      )}

      {!loadingAnalytics && !analytics && (
        <p className="theme-text font-mono">No analytics data yet.</p>
      )}

      {!loadingAnalytics && analytics && (
        <div className="flex flex-col gap-10 pt-10">

          {/* Inline Summary Card: Transactions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="theme-card theme-border border-2 rounded-md p-4 flex-1">
              <p className="theme-text font-mono text-sm opacity-70 text-center">Total transactions</p>
              <p className="theme-text font-mono text-2xl font-bold text-center">₱{analytics.totalSpent}</p>
            </div>
          </div>

          {/* Inline Chart: Transactions */}
          <div className="mt-6">
            {!analytics.spendingByCategory || analytics.spendingByCategory.length === 0 ? (
              <div className="theme-text font-mono">No category data yet.</div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.spendingByCategory}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2f6fed" radius={[4, 4, 0, 0]} />
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