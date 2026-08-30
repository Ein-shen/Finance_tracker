import React, { useEffect, useState } from 'react'
import { auth } from '../../firebase'
import { fetchAnalytics } from '../../data_analytics/AnlyticsUtils'
import { SummaryCards } from '../../data_analytics/SummaryCards'
import { CategoryChart } from '../../data_analytics/CategoryChart'

export const Analytics = () => {
  // ==========================================
  // LOADING
  // ==========================================

  const [authLoading, setAuthLoading] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // ==========================================
  // ANALYTICS DATA
  // ==========================================

  const [analytics, setAnalytics] = useState(null)

  // ==========================================
  // WAIT FOR FIREBASE AUTH
  // ==========================================

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Firebase user:', user)
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  // ==========================================
  // GET ANALYTICS
  // ==========================================

  const getAnalytics = async () => {
    try {
      setLoadingAnalytics(true)

      const user = auth.currentUser

      if (!user) {
        console.log('No Firebase user logged in')
        setAnalytics(null)
        return
      }

      const data = await fetchAnalytics()

      console.log('Analytics received:', data)

      setAnalytics(data)
    } catch (error) {
      console.error('Get analytics error:', error)
      alert(error.message || 'Failed to get analytics')
    } finally {
      setLoadingAnalytics(false)
    }
  }

  // ==========================================
  // LOAD ANALYTICS AFTER AUTH
  // ==========================================

  useEffect(() => {
    if (!authLoading) {
      getAnalytics()
    }
  }, [authLoading])

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (authLoading) {
    return (
      <div className="w-full md:pt-0">
        <p className="theme-text font-mono px-4 sm:px-8 md:px-12 lg:px-20">
          Checking login...
        </p>
      </div>
    )
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">

      <h1 className="font-mono text-lg sm:text-2xl theme-text">
        Analytics
      </h1>

      <div className="w-full h-96 flex-1 flex-col">
        
      </div>

      <div>
        {loadingAnalytics && (
          <p className="theme-text font-mono">
            Loading analytics...
          </p>
        )}

        {!loadingAnalytics && !analytics && (
          <p className="theme-text font-mono">
            No analytics data yet.
          </p>
        )}

        {!loadingAnalytics && analytics && (
          <>
            <SummaryCards data={analytics} />
            <CategoryChart
              spending={analytics.spendingByCategory}
              upcoming={analytics.upcomingByCategory}
            />
          </>
        )}
      </div>

    </div>
  )
}