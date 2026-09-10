import React, { useState } from 'react'
import { Toogle, useTheme } from "./Toogle"
import { Sun, Moon } from 'lucide-react'
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
    <div className="flex flex-col gap-10">

      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20">
        <h1 className="font-mono text-2xl">
          Settings
        </h1>
      </div>

      <div className="theme-card py-4 space-y-4 theme-border border px-3 rounded-md w-[70%] mx-auto flex flex-col justify-center items-stretch">
  
        {/* Theme Toggle Item */}
        <div className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-20 flex flex-row justify-between items-center">
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
            <Toogle />
          </span>
          
        </div>

        {/* About Button */}
        <button 
          className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-20 font-mono text-md text-left transition-colors hover:opacity-80"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('/dashboard/about')
          }}
        >
          About
        </button>

        {/* Support Button */}
        <button
          className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-20 font-mono text-md text-left transition-colors hover:opacity-80"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('/dashboard/support')
          }}
        >
          Support
        </button>

        {/* Help Button */}
        <button
          className="w-full border-b pb-4 px-6 sm:px-8 md:px-12 lg:px-20 font-mono text-md text-left transition-colors hover:opacity-80"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('/dashboard/help')
          }}
        >
          Ask for help
        </button>

        {/* Language Button */}
        <button
          className="w-full pb-2 px-6 sm:px-8 md:px-12 lg:px-20 font-mono text-md text-left transition-colors hover:opacity-80"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('')
          }}
        >
          Language
        </button>

      </div>
    </div>
  )
}