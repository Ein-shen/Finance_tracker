import React from 'react'
import { Calendar, BarChart2, User, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Schedule', icon: Calendar, path: '/dashboard/schedule' },
  { label: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
  { label: 'Account', icon: User, path: '/dashboard/account' },
  { label: 'Transaction', icon: Receipt, path: '/dashboard/transaction' },
]

export const Leftsidebar = () => {
  const navigate = useNavigate()

  return (
    <div
      className='h-screen w-64 border-r-2 fixed left-0 flex flex-col items-center text-center space-y-2'
      style={{ borderColor: 'var(--text-color)' }}
    >
      <div className='flex flex-row items-center gap-2 py-6 '>
        <img src="/suitcase.png" alt="Suitcase" className="w-10 h-12" />
        <h1 className='font-mono text-lg'>Track ur Expenses</h1>
      </div>

      <div className='w-full space-y-4 px-6'>
        {navItems.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className='w-full flex items-center gap-2 font-mono text-md rounded-md p-2 hover:bg-gray-100 hover:text-black hover:border-2 border-black'
            style={{ border: '2px solid var(--text-color)' }}
          >
            <Icon className='w-4 h-4' />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}