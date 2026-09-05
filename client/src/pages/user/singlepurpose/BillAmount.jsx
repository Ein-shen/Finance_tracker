import { useState, useEffect } from 'react'
import { auth } from '../../../firebase'
import { fetchAnalytics } from '../../../data_analytics/AnlyticsUtils'
import { SummaryCards } from '../../../data_analytics/SummaryCards'

//=============================================================================
// PURPOSE OF THIS FILE: FETCH TRANSACTION + SCHEDULE ANALYTICS TO IMPORT FREELY
//
// Props:
//   refreshKey - change this value (e.g. bump a counter) to force a refetch
//=============================================================================
export const BillAmount = ({ refreshKey }) => {

  const [authLoading, setAuthLoading] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
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

  // ==========================================
  // LOAD ANALYTICS (after auth resolves, and whenever refreshKey changes)
  // ==========================================
  useEffect(() => {
    if (!authLoading) {
      getAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, refreshKey])

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className='space-y-2 sm:space-y-4 w-full'>
      <h1 className='font-mono text-base sm:text-lg'>
        Monthly Expenses
      </h1>

      {loadingAnalytics && (
        <p className="theme-text font-mono text-sm sm:text-base">Loading...</p>
      )}

      {!loadingAnalytics && analytics && (
        <SummaryCards
          cards={[
            { label: 'Total expenses', value: `₱${analytics.totalSpent + analytics.totalUpcoming}` },
          ]}
        />
      )}
    </div>
  )
}