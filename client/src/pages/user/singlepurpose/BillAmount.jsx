
import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'
import { auth, db } from '../../../firebase'
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { HashLoader } from 'react-spinners'

const peso = (n) =>
  `₱${Number(n || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`

export const BillAmount = ({ refreshKey }) => {
  const [billAmount, setBillAmount] = useState(() => {
    // Try to load cached value IMMEDIATELY
    const cached = localStorage.getItem('bill_amount_cache')

    if (cached !== null) {
      return Number(cached) || 0
    }

    return 0
  })

  const [loading, setLoading] = useState(() => {
    // If we already have cache, don't show loading
    return localStorage.getItem('bill_amount_cache') === null
  })

  useEffect(() => {
    let cancelled = false

    const loadBills = async () => {
      // Wait for current Firebase user
      const user = auth.currentUser

      if (!user) {
        setLoading(false)
        return
      }

      try {
        const q = query(
          collection(db, 'bills'),
          where('userId', '==', user.uid)
        )

        const snapshot = await getDocs(q)

        let total = 0

        snapshot.forEach((doc) => {
          const data = doc.data()

          total += Number(data.amount) || 0
        })

        if (cancelled) return

        // Update UI
        setBillAmount(total)

        // SAVE CACHE
        localStorage.setItem(
          'bill_amount_cache',
          String(total)
        )

        console.log('Bill amount cached:', total)
      } catch (error) {
        console.error('Failed to load bills:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    // Firebase auth may not have initialized yet.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadBills()
      } else {
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [refreshKey])

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
