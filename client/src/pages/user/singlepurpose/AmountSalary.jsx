import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { auth } from '../../../firebase'
import { API_URL } from '../../../api'

//=============================================================================
// PURPOSE OF THIS FILE: FETCH THE SALARY AMOUNT TO IMPORT INTO OTHER FILES FREELY
//
// Props:
//   onAddClick  - called when the user clicks "Add" while there's no salary yet
//   refreshKey  - change this value (e.g. bump a counter) to force a refetch,
//                 useful right after a parent successfully saves a new salary
//=============================================================================
export const AmountSalary = ({ onAddClick, refreshKey }) => {

  const [authLoading, setAuthLoading] = useState(true)
  const [loadingSalary, setLoadingSalary] = useState(true)
  const [getSalary, setGetSalary] = useState(null)

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
  // LOAD SALARY (after auth resolves, and whenever refreshKey changes)
  // ==========================================
  useEffect(() => {
    if (!authLoading) {
      fetchSalary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, refreshKey])

  // ==========================================
  // RENDER
  // ==========================================
  if (loadingSalary) {
    return <p className="theme-text font-mono text-sm sm:text-base">Loading salary...</p>
  }

  if (getSalary === null || getSalary === undefined) {
    return (
      <div className='space-y-3 sm:space-y-4 w-full'>
        <p className="theme-text font-mono text-sm sm:text-base">No Salary yet.</p>
        <button
          type='button'
          onClick={onAddClick}
          className='theme-bg theme-hover theme-border border-2 w-full rounded-md flex flex-col justify-center items-center h-16 sm:h-20'
        >
          <Plus size={20} className='sm:hidden' />
          <Plus size={25} className='hidden sm:block' />
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-2 sm:space-y-4 w-full'>
      <h1 className='font-mono text-base sm:text-lg'>
        Monthly salary
      </h1>

      <div className="theme-card bg-green theme-border border-2 rounded-md p-3 sm:p-4">
        <p className="theme-text font-mono text-xs sm:text-sm opacity-70 text-center">Monthly Salary</p>
        <p className="theme-text font-mono text-xl sm:text-2xl font-bold text-center break-words">
          ₱{getSalary}
        </p>
      </div>
    </div>
  )
}