import { useState, useEffect } from 'react'
import { PiggyBank } from 'lucide-react'
import { auth } from '../../../firebase'
import { fetchAnalytics } from '../../../data_analytics/AnlyticsUtils'
import { API_URL } from '../../../api'
import { HashLoader } from 'react-spinners'

// =============================================================================
// PURPOSE OF THIS FILE: 
// Show remaining balance = Salary - (Schedule + Transactions Expenses).
//
// LOCAL STORAGE STRATEGY:
// 1. Caches both the user's salary and analytics separately in localStorage 
//    using user-specific keys (`user_salary_UID` and `bill_analytics_UID`).
// 2. Instantly displays cached salary & expenses on component mount so the UI 
//    doesn't flash empty or wait on network latency.
// 3. Fetches fresh data from the server in the background and saves updates to cache.
//
// Props:
//  refreshKey - change this value (e.g. bump a counter) to force a refetch,
//               useful right after salary or a bill is added/updated elsewhere
// =============================================================================

const peso = (n) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`

export const MInusSalary = ({ refreshKey }) => {
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingSalary, setLoadingSalary] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  
  const [getSalary, setGetSalary] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  // ==========================================
  // STEP 1: WAIT FOR FIREBASE AUTH
  // Ensures we know the logged-in user before trying 
  // to fetch data or read user-specific localStorage keys.
  // ==========================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Firebase user:', user)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  // ==========================================
  // STEP 2: LOAD FROM LOCAL STORAGE CACHE FIRST
  // Instantly populates salary and analytics from localStorage 
  // if they were saved previously.
  // ==========================================
  useEffect(() => {
    if (authLoading) return

    const user = auth.currentUser
    if (user) {
      // 1. Load cached salary
      const cachedSalary = localStorage.getItem(`user_salary_${user.uid}`)
      if (cachedSalary !== null) {
        try {
          setGetSalary(JSON.parse(cachedSalary))
          setLoadingSalary(false)
        } catch (e) {
          console.error('Failed to parse cached salary:', e)
        }
      }

      // 2. Load cached analytics (shares key with BillAmount component)
      const cachedAnalytics = localStorage.getItem(`bill_analytics_${user.uid}`)
      if (cachedAnalytics) {
        try {
          setAnalytics(JSON.parse(cachedAnalytics))
          setLoadingAnalytics(false)
        } catch (e) {
          console.error('Failed to parse cached analytics:', e)
        }
      }
    }
  }, [authLoading])

  // ==========================================
  // STEP 3: FETCH FRESH SALARY FROM API & CACHE IT
  // ==========================================
  const fetchSalary = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        setGetSalary(null)
        setLoadingSalary(false)
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

      const salaryValue = data.salary ?? null
      setGetSalary(salaryValue)

      // Save fresh salary to localStorage so it loads instantly next time
      localStorage.setItem(`user_salary_${user.uid}`, JSON.stringify(salaryValue))

    } catch (error) {
      console.error('Get salary error:', error)
      // Only alert if we don't have a cached salary showing yet
      if (getSalary === null) {
        alert(error.message || 'Failed to get salary')
      }
    } finally {
      setLoadingSalary(false)
    }
  }

  // ==========================================
  // STEP 4: FETCH FRESH ANALYTICS & CACHE IT
  // ==========================================
  const getAnalytics = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        setAnalytics(null)
        setLoadingAnalytics(false)
        return
      }

      const data = await fetchAnalytics()
      setAnalytics(data)

      // Save to localStorage (shared key with BillAmount)
      localStorage.setItem(`bill_analytics_${user.uid}`, JSON.stringify(data))

    } catch (error) {
      console.error('Get analytics error:', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  // ==========================================
  // STEP 5: LOAD DATA AFTER AUTH OR REFRESH KEY
  // ==========================================
  useEffect(() => {
    if (!authLoading) {
      fetchSalary()
      getAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, refreshKey])

  // ==========================================
  // STEP 6: RENDER
  // ==========================================
  // Only show loader spinner if we are loading AND have no cached data at all yet
  const isLoading = (loadingSalary && getSalary === null) || (loadingAnalytics && !analytics)
  const hasSalary = getSalary !== null && getSalary !== undefined
  const totalExpenses = analytics ? analytics.totalSpent + analytics.totalUpcoming : 0
  const remaining = hasSalary ? getSalary - totalExpenses : null
  const isOverspent = remaining !== null && remaining < 0

  return (
    <div className='space-y-2 sm:space-y-4 w-full'>
      <div className='flex items-center gap-2'>
        
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