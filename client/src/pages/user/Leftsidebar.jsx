import React from 'react'
import {
  Calendar,
  BarChart2,
  User,
  Receipt,
  Settings,
  LogOut,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const navItems = [
  {
    label: 'Transaction',
    icon: Receipt,
    path: '/dashboard/transaction',
  },
  {
    label: 'Analytics',
    icon: BarChart2,
    path: '/dashboard/analytics',
  },
  {
    label: 'Schedule',
    icon: Calendar,
    path: '/dashboard/schedule',
  },
  {
    label: 'Account',
    icon: User,
    path: '/dashboard/account',
  },
]

const navItemsUnder = [
  {
    label: 'Settings',
    icon: Settings,
    path: '/dashboard/settings',
  },
  {
    label: 'Signout',
    icon: LogOut,
    path: '/dashboard/signout',
  },
]

export const Leftsidebar = () => {
  const navigate = useNavigate()

  return (
    <div
      className="
        h-screen
        w-64
        fixed
        left-0
        flex
        flex-col
        items-center
        text-center
        theme-bg
        theme-text
        theme-border
        border-r-2
      "
    >

      {/* Logo / Dashboard Home */}
      <button
        onClick={() => navigate('/dashboard')}
        className="
          flex
          flex-row
          items-center
          gap-2
          py-6
        "
      >
        <img
          src="/suitcase.png"
          alt="Suitcase"
          className="w-10 h-12"
        />

        <h1 className="font-mono text-lg">
          Expense Tracker
        </h1>
      </button>


      {/* Main Navigation */}
      <div className="w-full space-y-4 px-6">

        {navItems.map(({ label, icon: Icon, path }) => (

          <button
            key={label}
            onClick={() => navigate(path)}
            className="
              w-full
              flex
              items-center
              gap-2
              font-mono
              text-md
              rounded-md
              p-2
              border-2
              theme-border
              theme-hover
            "
          >
            <Icon className="w-4 h-4" />

            {label}
          </button>

        ))}

      </div>


      {/* Bottom Navigation */}
      <div className="w-full space-y-4 px-6 mt-auto pb-6">

        {navItemsUnder.map(({ label, icon: Icon, path }) => (

          <button
            key={label}
            onClick={() => navigate(path)}
            className="
              w-full
              flex
              items-center
              gap-2
              font-mono
              text-md
              rounded-md
              p-2
              border-2
              theme-border
              theme-hover
            "
          >
            <Icon className="w-4 h-4" />

            {label}
          </button>

        ))}

      </div>

    </div>
  )
}