
import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'
import { auth } from '../../../firebase'
import { fetchAnalytics } from '../../../data_analytics/AnlyticsUtils'
import { HashLoader } from 'react-spinners'

const getCacheKey = (uid) => `bill_amount_${uid}`

const peso = (n) =>
  `₱${Number(n || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`

export const BillAmount = ({ refreshKey }) => {

  // ==========================================
  // CACHE STATE
  // ==========================================
  const [billAmount, setBillAmount] = useState(() => {
    // Try previous user's cache immediately
    const lastUser = localStorage.getItem('bill_amount_last_user')

    if (!lastUser) {
      console.log('No previous bill cache user')
      return 0
    }

    const cached = localStorage.getItem(
      getCacheKey(lastUser)
    )

    console.log(
      'Initial bill cache:',
      cached
    )

    return cached !== null
      ? Number(cached) || 0
      : 0
  })

  const [loading, setLoading] = useState(() => {
    const lastUser = localStorage.getItem(
      'bill_amount_last_user'
    )

    if (!lastUser) {
      return true
    }

    return localStorage.getItem(
      getCacheKey(lastUser)
    ) === null
  })

  // ==========================================
  // FIREBASE
  // ==========================================
  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {

        if (!user) {
          setBillAmount(0)
          setLoading(false)
          return
        }

        const uid = user.uid
        const cacheKey = getCacheKey(uid)

        console.log(
          'Firebase UID:',
          uid
        )

        // ==========================================
        // LOAD THIS USER'S CACHE
        // ==========================================
        const cached = localStorage.getItem(
          cacheKey
        )

        if (cached !== null) {

          const cachedAmount = Number(cached)

          if (!Number.isNaN(cachedAmount)) {

            console.log(
              'Using cached bill amount:',
              cachedAmount
            )

            setBillAmount(cachedAmount)
            setLoading(false)
          }
        }

        // Remember which user owns the cache
        localStorage.setItem(
          'bill_amount_last_user',
          uid
        )

        // ==========================================
        // FETCH FRESH DATA IN BACKGROUND
        // ==========================================
        try {

          console.log(
            'Fetching fresh analytics...'
          )

          const data = await fetchAnalytics()

          const total =
            Number(data?.totalSpent || 0) +
            Number(data?.totalUpcoming || 0)

          console.log(
            'Fresh bill amount:',
            total
          )

          // Update UI
          setBillAmount(total)

          // ==========================================
          // SAVE TO LOCAL STORAGE
          // ==========================================
          localStorage.setItem(
            cacheKey,
            String(total)
          )

          console.log(
            'SAVED TO LOCAL STORAGE:',
            cacheKey,
            total
          )

        } catch (error) {

          console.error(
            'Failed to fetch analytics:',
            error
          )

        } finally {

          setLoading(false)
        }
      }
    )

    return unsubscribe

  }, [refreshKey])

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-2 sm:space-y-4 w-full">

      <div className="flex items-center gap-2">

        <Receipt
          size={16}
          className="opacity-60"
        />

        <h1 className="font-mono text-base sm:text-lg">
          Monthly expenses
        </h1>

      </div>

      {loading ? (

        <div className="flex items-center py-3">

          <HashLoader
            size={19}
            color="#dddfe9"
          />

        </div>

      ) : (

        <div className="bg-[#0077B6] rounded-md p-3 sm:p-4">

          <p className="theme-text font-mono text-xs sm:text-sm opacity-70">
            Total expenses
          </p>

          <p className="theme-text font-mono text-2xl sm:text-3xl font-bold tabular-nums break-words">
            {peso(billAmount)}
          </p>

        </div>

      )}

    </div>
  )
}
