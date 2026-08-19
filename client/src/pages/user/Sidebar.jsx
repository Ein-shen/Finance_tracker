import React from 'react'
import { Calendar, BarChart2, User } from 'lucide-react'

const navItems = [
  { label: 'Schedule', icon: Calendar },
  { label: 'Analytics', icon: BarChart2 },
  { label: 'Account', icon: User },
]

export const Sidebar = () => {
  return (
    <div className='h-screen w-64 border-r-2 border-black fixed left-0 flex flex-col items-center text-center space-y-2 '>
      <div className='flex flex-row items-center gap-2 py-6 '>
        <img src="/suitcase.png" alt="Suitcase" className="w-10 h-12" />
        <h1 className='font-mono text-lg'>Track ur Expenses</h1>
      </div>
      

      <div className='w-full space-y-4 px-6'>
      {navItems.map(({ label, icon: Icon }) => (
        <button
          key={label}
          className='w-full flex items-center gap-2 font-mono text-md border-2 rounded-md p-2 hover:bg-gray-100'
        >
          <Icon className='w-4 h-4' />
          {label}
        </button>
      ))}
    </div>
    </div>
  )
}