import React from 'react'
import { Outlet } from 'react-router-dom'
import { Leftsidebar } from './Leftsidebar'
import { Rightsidebar } from './Rightsidebar'

export const Dashboard = () => {
  return (
    <div>
      <Leftsidebar />
      

      <div className="pt-25 md:pt-20 ml-0 md:ml-64 pt-16 md:pt-8 px-4 sm:px-8 md:px-12 lg:px-20">
        <Outlet />
      </div>
    </div>
  )
}