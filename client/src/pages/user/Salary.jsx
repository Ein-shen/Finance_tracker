import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { auth } from '../../firebase'
import { SummaryCards } from '../../data_analytics/SummaryCards'
import { fetchAnalytics } from '../../data_analytics/AnlyticsUtils'

export const Salary = () => {

  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [salary, setSalary] = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingSalary, setLoadingSalary] = useState(true)
  const [getSalary, setGetSalary] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)


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

      console.log('Current Firebase user: ', user)

      if (!user) {
        console.log('No Firebase user Logged in')
        setGetSalary(null)
        return
      }

      const token = await user.getIdToken()

      const response = await fetch('http://localhost:5000/api/users/salary', {
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
  // LOAD SALARY + ANALYTICS (only after auth resolves)
  // ==========================================
  useEffect(() => {
    if (!authLoading) {
      fetchSalary()
      getAnalytics()
    }
  }, [authLoading])


  // ==========================================
  // ADD SALARY
  // ==========================================
  const handleAddSalary = async () => {
    if (!salary) {
      alert('Please fill in the salary text box')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser
      if (!user) {
        throw new Error('You must be logged in first')
      }

      const token = await user.getIdToken()

      const response = await fetch('http://localhost:5000/api/users/salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          salary: Number(salary),
        }),
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
        throw new Error(data.message || 'Failed to add salary')
      }

      setSalary('')
      setShowAdd(false)
      fetchSalary() // refresh the displayed salary after saving

    } catch (error) {
      console.error('Salary Error:', error)
      alert(error.message || 'Failed to add salary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full flex justify-center'>
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 w-full'>

        {/* SALARY DISPLAY */}
        <div className="space-y-4">

          <h1 className='font-mono text-lg'>
            Monthly Salary
          </h1>
          {loadingSalary && (
            <p className="theme-text font-mono">Loading salary...</p>
          )}

          {!loadingSalary && (getSalary === null || getSalary === undefined) && (
            <>
              <p className="theme-text font-mono">No Salary yet.</p>
              <button
                type='button'
                onClick={() => setShowAdd(true)}
                className='theme-bg theme-hover theme-border border-2 w-full rounded-md flex flex-col justify-center items-center h-20'
              >
                <Plus size={25} />
              </button>
            </>
          )}
          {!loadingSalary && getSalary !== null && getSalary !== undefined && (
            <div className="theme-card theme-border border-2 rounded-md p-4">
              <p className="theme-text font-mono text-sm opacity-70 text-center">Monthly Salary</p>
              <p className="theme-text font-mono text-2xl font-bold text-center">
                ₱{getSalary}
              </p>
            </div>
          )}
        </div>

        {/* ADD SALARY POPUP */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                if (!loading) setShowAdd(false)
              }}
            />

            <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-xl">Add Monthly Salary</h2>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowAdd(false)}
                  className="theme-text theme-hover rounded-md p-1 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-md">Salary</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Ex. 15,000"
                    className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                  />
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAddSalary}
                  className="theme-bg theme-hover theme-border border-2 w-full rounded-md py-2 font-mono disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='space-y-4'>
          <h1 className='font-mono text-lg'>
            Monthly Transaction
          </h1>

          {loadingAnalytics && (
            <p className="theme-text font-mono">Loading...</p>
          )}

          {!loadingAnalytics && analytics && (
            <SummaryCards
              cards={[
                { label: 'Upcoming bills', value: `₱${analytics.totalUpcoming}` },

              ]}
            />
          )}
        </div>

        <div className='space-y-4'>
          <h1 className='font-mono text-lg'>
            Monthly Schedule
          </h1>


          {loadingAnalytics && (
            <p className="theme-text font-mono">Loading...</p>
          )}

          {!loadingAnalytics && analytics && (
            <SummaryCards
                cards={[
                  { label: 'Scheduled bills', value: `₱${analytics.totalSpent}` },
                 ]}
            />
          )}
        </div>

        <div className='space-y-4'>
          <h1 className='font-mono text-lg'>
            Monthly Spending
          </h1>

          {loadingAnalytics && (
            <p className="theme-text font-mono">Loading...</p>
          )}

          {!loadingAnalytics && analytics && (
            <SummaryCards
                cards={[
                  { label: 'Total bills', value: `₱${analytics.totalUpcoming + analytics.totalSpent}` }
                 ]}
            />
          )}
        </div>

      </div>
    </div>
  )
}