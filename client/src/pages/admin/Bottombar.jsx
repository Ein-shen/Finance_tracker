import React from 'react'
import { House, User, Settings, BarChart3 } from 'lucide-react'
import { NavLink } from 'react-router-dom'


export const Bottombar = () => {
  return (
    <div className='w-full fixed bottom-0 z-50 p-10 flex justify-center items-center '>
      <div className='theme-bg flex flex-row rounded-md border-2  space-x-10' >
       <NavLink to='/admin/admindashboard' className='theme-bg theme-hover p-4 rounded-md'>
          <House />
        </NavLink>

        <NavLink to='user' className='theme-bg theme-hover p-4 rounded-md'>
          <User />
        </NavLink>

        <NavLink to='adminanalytics' className='theme-bg theme-hover p-4 rounded-md'>
          <BarChart3 />
        </NavLink>

        <NavLink to='settings' className='theme-bg theme-hover p-4 rounded-md'>
          <Settings />
        </NavLink>

      </div>
    </div>
  )
}