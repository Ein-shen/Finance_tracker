import React from 'react'
import { Outlet } from 'react-router-dom'
import { Upperbar } from './Upperbar'

export const AdminDashboard = () => {
  return (
    <div>
      <Upperbar />
      
      {/* Container with clean top-padding and left-margin for fixed sidebar offset */}
      <div className="pt-20 md:ml-64 px-4 sm:px-8 md:px-12 lg:px-20">
        <Outlet />
      </div>
    </div>
  )
}