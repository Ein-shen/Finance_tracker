import React, { useEffect, useState } from 'react'
import { auth } from '../../firebase'
import { fetchAnalytics } from '../../data_analytics/AnlyticsUtils'
import { SummaryCards } from '../../data_analytics/SummaryCards'
import { CategoryChart } from '../../data_analytics/CategoryChart'

export const Analytics = () => {
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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

      const data = await fetchAnalytics()

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

  if (authLoading) {
    return (
      <div className="w-full md:pt-0">
        <p className="theme-text font-mono px-4 sm:px-8 md:px-12 lg:px-20">
          Checking login...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20">

      <h1 className="font-mono text-lg sm:text-2xl theme-text mb-6">
        Analytics
      </h1>

      {loadingAnalytics && (
        <p className="theme-text font-mono">Loading analytics...</p>
      )}

      {!loadingAnalytics && !analytics && (
        <p className="theme-text font-mono">No analytics data yet.</p>
      )}

      {!loadingAnalytics && analytics && (
        <div className="flex flex-col gap-10">

          {/* ======================================
              TRANSACTIONS
          ====================================== */}

          <div>
            <h2 className="font-mono text-xl theme-text mb-4">
              Transactions
            </h2>

            <SummaryCards
              cards={[
                { label: 'Total Spent', value: `₱${analytics.totalSpent}` },
              ]}
            />

            <div className="mt-6">
              <CategoryChart data={analytics.spendingByCategory} />
            </div>
          </div>

          {/* ======================================
              SCHEDULE
          ====================================== */}

          <div>
            <h2 className="font-mono text-xl theme-text mb-4">
              Schedule
            </h2>

            <SummaryCards
              cards={[
                { label: 'Upcoming Bills', value: `₱${analytics.totalUpcoming}` },
                { label: 'Unpaid Bills', value: analytics.unpaidCount },
              ]}
            />

            <div className="mt-6">
              <CategoryChart data={analytics.upcomingByCategory} />
            </div>
          </div>

        </div>
      )}

    </div>
  )
}