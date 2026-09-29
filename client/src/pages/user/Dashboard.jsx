import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Leftsidebar } from './Leftsidebar'
import { Navbar } from './Navbar'

export const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setIsOpen(true)} />
      <Leftsidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="pt-16 ml-0 md:ml-64 px-4 sm:px-6 lg:px-8">
        <div className="pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}