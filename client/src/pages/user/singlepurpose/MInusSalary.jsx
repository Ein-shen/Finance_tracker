import { useState, useEffect } from 'react'
import { PiggyBank } from 'lucide-react'
import { auth } from '../../../firebase'
import { fetchAnalytics } from '../../../data_analytics/AnlyticsUtils'
import { API_URL } from '../../../api'
import { HashLoader } from 'react-spinners'
//=============================================================================
// PURPOSE OF THIS FILE: SHOW REMAINING BALANCE = SALARY - (SCHEDULE + TRANSACTIONS)
//
// Props:
//   refreshKey - change this value (e.g. bump a counter) to force a refetch,
//                useful right after salary or a bill is added/updated elsewhere
//=============================================================================

const peso = (n) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`

export const MInusSalary = ({ refreshKey }) => {
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingSalary, setLoadingSalary] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [getSalary, setGetSalary] = useState(null)
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
  // GET SALARY
  // ==========================================
  const fetchSalary = async () => {
    try {
      setLoadingSalary(true)
      const user = auth.currentUser
      if (!user) {
        console.log('No Firebase user Logged in')
        setGetSalary(null)
        return
      }
      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/users/salary`, {
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
        throw new Error(data.message || 'Failed to get Salary')
      }
      setGetSalary(data.salary ?? null)
    } catch (error) {
      console.error('Get salary error:', error)
      alert(error.message || 'Failed to get salary')
    } finally {
      setLoadingSalary(false)
    }
  }

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
  // LOAD SALARY + ANALYTICS (after auth resolves, and whenever refreshKey changes)
  // ==========================================
  useEffect(() => {
    if (!authLoading) {
      fetchSalary()
      getAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, refreshKey])

  // ==========================================
  // RENDER
  // ==========================================
  const isLoading = loadingSalary || loadingAnalytics
  const hasSalary = getSalary !== null && getSalary !== undefined
  const totalExpenses = analytics ? analytics.totalSpent + analytics.totalUpcoming : 0
  const remaining = hasSalary ? getSalary - totalExpenses : null
  const isOverspent = remaining !== null && remaining < 0

  return (
    <div className='space-y-2 sm:space-y-4 w-full'>
      <div className='flex items-center gap-2'>
        <PiggyBank size={16} className='opacity-60' />
        <h1 className='font-mono text-base sm:text-lg'>Remaining salary</h1>
      </div>

      {isLoading && (
        <p className="theme-text font-mono text-sm sm:text-base opacity-60"><HashLoader
          loading={loadingAnalytics}
          size={19}
          color="#dddfe9"
        />
        </p>
      )}

      {!isLoading && !hasSalary && (
        <p className="theme-text font-mono text-sm sm:text-base opacity-60">No salary set yet.</p>
      )}

      {!isLoading && hasSalary && analytics && (
        <div className={`bg-[#A35311]  rounded-md p-3 sm:p-4 ${isOverspent ? 'border-l-rose-500' : 'border-l-indigo-500'}`}>
          <p className="theme-text font-mono text-xs sm:text-sm opacity-70">Salary minus expenses</p>
          <p className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums break-words ${isOverspent ? 'text-rose-400' : 'theme-text'}`}>
            {peso(remaining)}
          </p>
        </div>
      )}
    </div>
  )
}