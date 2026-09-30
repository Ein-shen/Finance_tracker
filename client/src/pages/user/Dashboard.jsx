import { Outlet } from 'react-router-dom'
import { Leftsidebar } from './Leftsidebar'
import { Navbar } from './Navbar'

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Leftsidebar />

      {/* pt-28 on mobile = navbar (16) + menu bar (12); pt-16 on desktop = navbar only */}
      <main className="pt-28 md:pt-16 ml-0 md:ml-64 px-4 sm:px-6 lg:px-8">
        <div className="pt-15">
          <Outlet />
        </div>
      </main>
    </div>
  )
}