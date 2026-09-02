import React from 'react'
import { House, User, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export const Bottombar = () => {
  return (
    <div className='w-full fixed bottom-0 p-10 flex justify-center items-center'>
      <div className='theme-bg flex flex-row rounded-full border-2 p-5 space-x-10'>
        <NavLink to='adminhome' end className='hover:theme-hover'>
          <House />
        </NavLink>

        <NavLink to='user' className='hover:theme-hover'>
          <User />
        </NavLink>

        <NavLink to='settings' className='hover:theme-hover'>
          <Settings />
        </NavLink>
      </div>
    </div>
  )
}