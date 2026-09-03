import React from 'react'
import { House, User, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Adminsignout } from './Adminsignout'

export const Bottombar = () => {
  return (
    <div className='w-full fixed bottom-0 p-10 flex justify-center items-center '>
      <div className='theme-bg flex flex-row rounded-md border-2  space-x-10' >
       <NavLink to='/admin/admindashboard' className='theme-bg theme-hover p-4 rounded-md'>
          <House />
        </NavLink>

        <NavLink to='user' className='theme-bg theme-hover p-4 rounded-md'>
          <User />
        </NavLink>

        <NavLink to='settings' className='theme-bg theme-hover p-4 rounded-md'>
          <Settings />
        </NavLink>

        <button  className='theme-bg theme-hover p-4 rounded-md'>
          <Adminsignout />
        </button>
        
      </div>
    </div>
  )
}