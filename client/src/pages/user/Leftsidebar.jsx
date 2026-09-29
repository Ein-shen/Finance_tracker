import React, { useState } from 'react'
import {
  Calendar,
  BarChart2,
  User,
  Receipt,
  Settings,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Transaction', icon: Receipt, path: '/dashboard/transaction' },
  { label: 'Schedule', icon: Calendar, path: '/dashboard/schedule' },
  { label: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
  { label: 'Account', icon: User, path: '/dashboard/account' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
]

export const Leftsidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigate = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Menu button - mobile only, small, under the navbar. Hidden while the drawer is open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="md:hidden fixed left-4 top-[4.75rem] z-30 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2 font-mono text-sm"
        >
          <Menu className="w-5 h-5" />
          
        </button>
      )}

      {/* Overlay - mobile only, starts right below the navbar */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar: always starts right below the navbar */}
      <div
        className={`theme-card w-64 fixed left-0 top-16 bottom-0 flex flex-col items-center text-center theme-text border-r border-border z-40 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Close button - mobile only. Brings the Menu button back */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-2"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Navigation */}
        <div className="w-full space-y-4 px-6 pt-5">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive =
              path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname === path ||
                  location.pathname.startsWith(path + '/')

            return (
              <button
                key={label}
                onClick={() => handleNavigate(path)}
                className={`w-full flex items-center gap-2 font-mono text-md rounded-md p-2 transition-colors theme-hover ${
                  isActive ? 'bg-[#606060] text-white' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}