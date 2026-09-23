import React, { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { auth } from '../../firebase'
import { fetchAnalytics } from '../../data_analytics/AnlyticsUtils'
import { SummaryCards } from '../../data_analytics/SummaryCards'
import { CategoryChart } from '../../data_analytics/CategoryChart'
import { HashLoader } from "react-spinners"
// Human readable label for a 'YYYY-MM' value, e.g. "September 2026"
const getMonthLabel = (ym) => {
  if (!ym) return ''
  const [year, month] = ym.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

// Build the last `count` months as 'YYYY-MM' values, newest first.
// NOTE: analytics is aggregated server-side, so we can't derive "months
// that actually have data" the way the Transactions/Schedule filters do.
// This just offers a rolling window instead.
const buildRecentMonths = (count = 12) => {
  const months = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }
  return months
}

export const Analytics = () => {
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  // MONTH FILTER - value is either '' (all time) or 'YYYY-MM'
  const [filterMonth, setFilterMonth] = useState('')

  const availableMonths = useMemo(() => buildRecentMonths(12), [])
  const filterMonthLabel = useMemo(() => getMonthLabel(filterMonth), [filterMonth])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const getAnalytics = async (month) => {
    try {
      setLoadingAnalytics(true)

      const user = auth.currentUser

      if (!user) {
        setAnalytics(null)
        return
      }

      // ASSUMPTION: fetchAnalytics accepts an optional 'YYYY-MM' month
      // string and returns data scoped to just that month; pass nothing
      // (or undefined) for all-time totals. If fetchAnalytics doesn't
      // support this yet, this param is currently ignored server-side
      // and the filter won't actually narrow the results - update
      // AnlyticsUtils.js / the API route to read it (e.g. as a query
      // param) and filter server-side, the same way transaction_date /
      // due_date are filtered elsewhere.
      const data = await fetchAnalytics(month || undefined)

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
      getAnalytics(filterMonth)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, filterMonth])

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

      {/* MONTH FILTER BAR */}
      <div className="mt-4 px-4 sm:px-8 md:px-12 lg:px-20 flex flex-wrap items-center gap-3">
        
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="rounded-md px-3 py-1.5 outline-none theme-bg theme-text theme-border font-mono text-sm"
        >
          <option value="">All Time</option>
          {availableMonths.map((ym) => (
            <option key={ym} value={ym}>
              {getMonthLabel(ym)}
            </option>
          ))}
        </select>
        
      </div>

      {/* ANALYTICS CONTENT */}
      <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-20 pb-10">
        {loadingAnalytics && (
          <HashLoader
            
            size={20}
            color="#dddfe9"
          />
        )}

        {!loadingAnalytics && !analytics && (
          <p className="theme-text font-mono">
            No analytics data {filterMonth ? `for ${filterMonthLabel}` : 'yet'}.
          </p>
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