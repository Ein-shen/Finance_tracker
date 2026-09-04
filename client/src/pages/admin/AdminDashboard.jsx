import React from 'react'
import { Outlet } from 'react-router-dom'
import { Upperbar } from './Upperbar'
import { Bottombar } from './Bottombar'
 



export const AdminDashboard = () => {
  return (
    <div>
      <Upperbar />
      <Bottombar />
      
      {/* Container with clean top-padding and left-margin for fixed sidebar offset */}
     <div className="pt-20  h-screen px-4 sm:px-8 md:px-12 lg:px-20">
        <Outlet />
      </div>
    </div>
  )
}