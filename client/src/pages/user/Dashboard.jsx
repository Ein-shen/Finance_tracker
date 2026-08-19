import React from 'react'
import { Outlet } from 'react-router-dom'
import { Leftsidebar } from './Leftsidebar'
import { Rightsidebar } from './Rightsidebar'

export const Dashboard = () => {
  return (
    <div>
      <Leftsidebar />
      <Rightsidebar />
      <div className="ml-64 pt-20 p-4"> {/* adjust margin/padding to clear sidebar + upperbar */}
        <Outlet />
      </div>
    </div>
  )
}