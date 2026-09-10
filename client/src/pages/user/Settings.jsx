import React, { useState } from 'react'
import { Toogle, useTheme } from "./Toogle"
import { Sun, Moon, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Settings = () => {

  const navigate = useNavigate()

  const [showOpen, setShowOpen] = useState(false)

  const handleNavigate = (path) => {
    navigate(path)

  }
  const { theme } = useTheme()

  const isLight = theme === 'light'

  return (
    <div className="flex flex-col gap-15">

      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20">
        <h1 className="font-mono text-2xl">
          Settings
        </h1>
      </div>

      <div className="theme-card py-4 space-y-4 theme-border border px-3 rounded-md w-[70%] mx-auto flex flex-col justify-center items-stretch">
  
        {/* Theme Toggle Item */}
        <div className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-5 flex flex-row justify-between items-center">
          <span className="flex items-center gap-3 font-mono">
            {isLight ? (
              <>
                Light Mode
                <Sun className="w-5 h-5" />
              </>
            ) : (
              <>
                Dark Mode
                <Moon className="w-5 h-5" />
              </>
            )}
          </span>

          <Toogle />
        </div>

        {/* About Button */}
        <button 
          className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-5 font-mono text-md transition-colors hover:opacity-80 flex items-center justify-between"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('/dashboard/about')
          }}
        >
          <span>About</span>
          <ChevronRight size={25} />
        </button>

        {/* Support Button */}
        <button
          className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-5 font-mono text-md transition-colors hover:opacity-80 flex items-center justify-between"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('/dashboard/support')
          }}
        >
          <span>Support</span>
          <ChevronRight size={25} />
        </button>

        {/* Help Button */}
        <button
          className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-5 font-mono text-md transition-colors hover:opacity-80 flex items-center justify-between"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('/dashboard/help')
          }}
        >
          <span>Ask for help </span>
          <ChevronRight size={25} />
        </button>

        {/* Language Button */}
        <button
          className="w-full  px-6 sm:px-8 md:px-12 lg:px-5 font-mono text-md transition-colors hover:opacity-80 flex items-center justify-between"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('')
          }}
        >
          <span>Language</span>
          <ChevronRight size={25} />
        </button>

      </div>
    </div>
  )
}