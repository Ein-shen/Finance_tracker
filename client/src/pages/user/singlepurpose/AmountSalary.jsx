import { useState, useEffect } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { auth } from '../../../firebase'
import { API_URL } from '../../../api'
import { HashLoader } from 'react-spinners'

//=============================================================================
// PURPOSE OF THIS FILE: FETCH THE SALARY AMOUNT TO IMPORT INTO OTHER FILES FREELY
//
// Props:
//   onAddClick  - called when the user clicks "Add" while there's no salary yet
//   refreshKey  - change this value (e.g. bump a counter) to force a refetch,
//                 useful right after a parent successfully saves a new salary
//=============================================================================

const peso = (n) =>
  `₱${Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
  })}`

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

      console.log('Current Firebase user:', user)

      if (!user) {
        console.log('No Firebase user logged in')
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

        throw new Error(
          `Server returned ${response.status} instead of JSON`
        )
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
  // LOAD SALARY
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
  return (
    <div className="space-y-3 sm:space-y-4 w-full ">

      {/* ==========================================
          HEADER
          This ALWAYS stays visible
      ========================================== */}
      <div className="flex items-center gap-2">
        <Wallet size={16} className="opacity-60" />

        <h1 className="font-mono text-base sm:text-lg">
          Monthly salary
        </h1>
      </div>


      {/* ==========================================
          LOADING
          Only the content UNDER the header loads
      ========================================== */}
      {loadingSalary ? (

        <div className="theme-text font-mono text-sm sm:text-base opacity-60">
          <HashLoader
            loading={loadingSalary}
            size={19}
            color="#dddfe9"
          />
        </div>

      ) : getSalary === null || getSalary === undefined ? (

        /* ==========================================
           NO SALARY
           Show the + button
        ========================================== */
        <button
          type="button"
          onClick={onAddClick}
          className="theme-hover theme-border border-2 border-dashed w-full rounded-md flex flex-col justify-center items-center h-16 sm:h-20 opacity-70 hover:opacity-100 transition-opacity"
        >
          <Plus size={20} className="sm:hidden" />

          <Plus size={25} className="hidden sm:block" />
        </button>

      ) : (

        /* ==========================================
           SALARY EXISTS
           Show the salary card
        ========================================== */
        <div className="  rounded-md p-3 sm:p-4 bg-[#588157] ">

          <p className="theme-text font-mono text-xs sm:text-sm opacity-70">
            Monthly salary
          </p>

          <p className="theme-text font-mono text-2xl sm:text-3xl font-bold tabular-nums break-words">
            {peso(getSalary)}
          </p>

        </div>
      )}

    </div>
  )
}