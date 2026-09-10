import React, { useState } from 'react'
import {
  Calendar,
  BarChart2,
  User,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Transaction', icon: Receipt, path: '/dashboard/transaction' },
  { label: 'Schedule', icon: Calendar, path: '/dashboard/schedule' },
  { label: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
  { label: 'Account', icon: User, path: '/dashboard/account' },
]

const navItemsUnder = [
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  { label: 'Signout', icon: LogOut, path: '/dashboard/signout' },
]

export const Leftsidebar = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigate = (path) => {
    navigate(path)
    setIsOpen(false) // close drawer after picking a page on mobile
  }

  return (
    <>
      {/* Hamburger button - only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md border-2 theme-border theme-bg theme-text"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay - only visible when drawer open on mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`h-screen theme-card w-64 fixed left-0 top-0 flex flex-col items-center text-center  theme-text theme-border border-r-[0.5px] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Close button - only visible on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo / Dashboard Home */}
        <button
          onClick={() => handleNavigate('/dashboard')}
          className="flex flex-row items-center gap-2 py-6"
        >
          <img src="/suitcase.png" alt="Suitcase" className="w-10 h-12" />
          <h1 className="font-mono text-lg">Expense Tracker</h1>
        </button>

        {/* Main Navigation */}
        <div className="w-full space-y-4 px-6">
          {navItems.map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              onClick={() => handleNavigate(path)}
              className="w-full flex items-center gap-2 font-mono text-md rounded-md p-2  theme-hover"
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
              onClick={() => handleNavigate(path)}
              className="w-full flex items-center gap-2 font-mono text-md rounded-md p-2  theme-hover"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}