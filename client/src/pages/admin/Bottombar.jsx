import React from 'react'
import { House, User, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export const Bottombar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (path) => {
    navigate(path)
  }

  return (
    <div className='w-full fixed bottom-0 p-10 flex justify-center items-center'>
      <div className='theme-bg flex flex-row rounded-full border-2 p-5 space-x-10'>
        <button
          onClick={() => handleClick('adminhome')}
          className={`hover:theme-hover ${location.pathname === '/' ? 'theme-active' : ''}`}
        >
          <House />
        </button>

        <button
          onClick={() => handleClick('user')}
          className={`hover:theme-hover ${location.pathname === '/user' ? 'theme-active' : ''}`}
        >
          <User />
        </button>

        <button
          onClick={() => handleClick('settings')}
          className={`theme-bg hover:theme-hover ${location.pathname === '/settings' ? 'theme-active' : ''}`}
        >
          <Settings />
        </button>
      </div>
    </div>
  )
}