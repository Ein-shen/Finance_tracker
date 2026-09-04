
import { UserAnalytics } from '../Adanalytics/UserAnalytics'
import { ScheduleAnalytics } from '../Adanalytics/ScheduleAnalytics'
import { TransactionAnalytics } from '../Adanalytics/TransactionAnalytics'
export const AdminAnalytics = () => {

  

  // ------------------------------------------
  // Main Render
  // ------------------------------------------
  return (
    <div className="w-full px-4 gap-10 pt-10 sm:px-8 md:px-12 lg:px-20 pb-30">
      <h1 className="font-mono text-lg sm:text-2xl theme-text mb-6">
        Admin Analytics
      </h1>

      
      <div className='flex flex-col space-y-10 pt-10'>
        <UserAnalytics />
        <ScheduleAnalytics />
        <TransactionAnalytics />
      </div>
        
    </div>
  )
}