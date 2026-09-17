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
    <div className="w-full md:pt-0 h-screen">
      {/* HEADER */}
      <div className="w-full   rounded-md px-5 flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 ">
        <h1 className="font-mono text-xl sm:text-2xl theme-text">
          Analytics
        </h1>
      </div>

      {/* ANALYTICS CONTENT */}
      <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-20 pb-10">
        {loadingAnalytics && (
          <p className="theme-text font-mono">Analytics loading...</p>
        )}

        {!loadingAnalytics && !analytics && (
          <p className="theme-text font-mono">No analytics data yet.</p>
        )}

        {!loadingAnalytics && analytics && (
          /* Dynamic Layout: Stacked vertically on mobile (flex-col), side-by-side on desktop (md:flex-row) */
          <div className="w-full h-auto flex flex-col md:flex-row gap-5 pt-10 items-start justify-center">

            {/* ======================================
                TRANSACTIONS
            ====================================== */}
            <div className="theme-card rounded-md w-full py-5 px-5">
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
            <div className="theme-card rounded-md w-full py-5 px-5">
              <h2 className="font-mono text-xl theme-text mb-4">
                Schedule
              </h2>

              <SummaryCards
                cards={[
                  { label: 'Upcoming Bills', value: `₱${analytics.totalUpcoming}` },
                ]}
              />

              <div className="mt-6">
                <CategoryChart data={analytics.upcomingByCategory} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}