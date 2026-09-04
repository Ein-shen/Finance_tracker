import { UserAnalytics } from '../Adanalytics/UserAnalytics'
import { ScheduleAnalytics } from '../Adanalytics/ScheduleAnalytics'
import { TransactionAnalytics } from '../Adanalytics/TransactionAnalytics'
import { Banned } from '../Adanalytics/Banned'
export const AdminHome = () => {
  return (
    <div className="flex flex-col gap-10 pt-10 h-screen">
      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20">
        <h1 className="font-mono text-2xl">Admin Overview</h1>
      </div>

      <div className="w-full pt-10 flex flex-col md:flex-row items-stretch gap-4 px-4 sm:px-8 md:px-12 lg:px-20">
          <div className="flex-1 min-w-0">
          <Banned />
        </div>
      </div>

      <div className="w-full pt-10 flex flex-col md:flex-row items-stretch gap-4 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="flex-1 min-w-0">
          <UserAnalytics />
        </div>
        <div className="flex-1 min-w-0">
          <ScheduleAnalytics />
        </div>
        <div className="flex-1 min-w-0">
          <TransactionAnalytics />
        </div>
      </div>
    </div>
  )
}