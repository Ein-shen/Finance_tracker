import { useEffect, useState } from 'react'
import { auth } from '../../firebase'
import { AmountSalary } from "./singlepurpose/AmountSalary"
import { BillAmount } from "./singlepurpose/BillAmount"
import { MInusSalary } from "./singlepurpose/MInusSalary"
import { SummaryCards } from '../../data_analytics/SummaryCards'
import { CategoryChart } from '../../data_analytics/CategoryChart'
import { fetchAnalytics, getCachedAnalytics } from '../../data_analytics/AnlyticsUtils'
import { Search } from 'lucide-react'

const formatPeso = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })

export const Index = () => {
  const [analytics, setAnalytics] = useState(() => getCachedAnalytics())

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return

      fetchAnalytics()
        .then(setAnalytics)
        .catch(console.error)
    })

    return unsubscribe
  }, [])

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 md:pt-2">

      <div className="flex flex-row items-center justify-between">
        <h1 className="font-mono text-xl sm:text-2xl theme-text">
          Financial overview
        </h1>

        <form className="flex flex-row space-x-4">
          <input
            placeholder="Search"
            className="theme-border theme-text border border-white/30 rounded-md px-3"
          />

          <button
            type="submit"
            className="theme-border border border-white/30 theme-hover hover:border-white/40 theme-bg px-5 py-2 rounded-md"
          >
            <Search color="gray" size={25} />
          </button>
        </form>
      </div>

      <div className="mt-6 px-5 pt-0 sm:pt-10">

        {/* CARDS */}
        <div className="flex flex-col gap-6 sm:gap-8">
          <AmountSalary />
          <BillAmount />
          <MInusSalary />
        </div>

        {analytics && (
          <>
            {/* TOTALS */}
            <div className="flex flex-row w-full gap-5 pt-10">

              <div className="theme-card rounded-xl w-full">
                <h2 className="font-mono text-xl theme-text text-center p-2">
                  Total Schedule
                </h2>

                <SummaryCards
                  cards={[
                    {
                      label: 'Upcoming Bills',
                      value: `₱${formatPeso(analytics.totalUpcoming)}`
                    }
                  ]}
                />
              </div>

              <div className="theme-card rounded-xl w-full">
                <h2 className="font-mono text-xl theme-text text-center p-2">
                  Total transaction
                </h2>

                <SummaryCards
                  cards={[
                    {
                      label: 'Total Spent',
                      value: `₱${formatPeso(analytics.totalSpent)}`
                    }
                  ]}
                />
              </div>

            </div>

            {/* CHARTS */}
            <div className="flex flex-col lg:flex-row gap-5 pt-5 pb-10">

              {/* TRANSACTIONS */}
              <div className="theme-card rounded-xl w-full py-5 px-5">
                <h2 className="font-mono text-xl theme-text mb-4">
                  Transactions
                </h2>

                <div className="mt-6">
                  <CategoryChart data={analytics.spendingByCategory} />
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="theme-card rounded-xl w-full py-5 px-5">
                <h2 className="font-mono text-xl theme-text mb-4">
                  Schedule
                </h2>

                <div className="mt-6">
                  <CategoryChart data={analytics.upcomingByCategory} />
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  )
}