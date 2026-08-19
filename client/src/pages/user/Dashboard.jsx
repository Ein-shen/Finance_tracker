import React from 'react'
import { Outlet } from 'react-router-dom'
import { Leftsidebar } from './Leftsidebar'
import { Rightsidebar } from './Rightsidebar'

export const Dashboard = () => {
  return (
    <div>
      <Leftsidebar />
      

      <div className="ml-64 mr-16 pt-20 p-4">
        <Outlet />
      </div>
    </div>
  )
}