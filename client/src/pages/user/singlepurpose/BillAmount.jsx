import { useState, useEffect } from 'react'
import { Receipt } from 'lucide-react'
import { auth } from '../../../firebase'
import { fetchAnalytics } from '../../../data_analytics/AnlyticsUtils'
import { HashLoader } from 'react-spinners'
//=============================================================================
// PURPOSE OF THIS FILE: FETCH TRANSACTION + SCHEDULE ANALYTICS TO IMPORT FREELY
//
// Props:
//   refreshKey - change this value (e.g. bump a counter) to force a refetch
//=============================================================================

const peso = (n) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`

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
  const totalExpenses = analytics ? analytics.totalSpent + analytics.totalUpcoming : 0

  return (
    <div className='space-y-2 sm:space-y-4 w-full'>
      <div className='flex items-center gap-2'>
        <Receipt size={16} className='opacity-60' />
        <h1 className='font-mono text-base sm:text-lg'>Monthly expenses</h1>
      </div>

      {loadingAnalytics && (
        <p className="theme-text font-mono text-sm sm:text-base opacity-60">
          <HashLoader
          loading={loadingAnalytics}
          size={19}
          color="#dddfe9"
        />
        </p>
      )}

      {!loadingAnalytics && analytics && (
        <div className="theme-card  rounded-md p-3 sm:p-4">
          <p className="theme-text font-mono text-xs sm:text-sm opacity-70">Total expenses</p>
          <p className="theme-text font-mono text-2xl sm:text-3xl font-bold tabular-nums break-words">
            {peso(totalExpenses)}
          </p>
        </div>
      )}
    </div>
  )
}