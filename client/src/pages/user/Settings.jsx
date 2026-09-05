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

      <div className="gap-5 w-[70%] mx-auto pt-10 flex flex-col justify-center items-center md:items-start gap-4 px-4 sm:px-8 md:px-12 lg:px-20">

        <div className="items-center border-2 w-full rounded-md flex flex-row justify-center p-2 gap-3">
          <span className="flex gap-2 font-mono items-center">
            {isLight ? (
              <>
                <Sun className="w-5 h-5" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                Dark Mode
              </>
            )}
          </span>

          <Toogle />
        </div>
          <button 
            className="w-full font-mono text-md text-center border-2 rounded-md p-2 w-48"
            onClick={() => {
              setShowOpen(false)
              handleNavigate('/dashboard/about')
            }}>
            About
          </button>
        

        <button
         className="w-full font-mono text-md text-center border-2 rounded-md p-2 w-48"
            onClick={() => {
              setShowOpen(false)
              handleNavigate('/dashboard/support')
            }}
           
        >
          Support
        </button>
          
        

        <button
          className="w-full  font-mono text-md text-center border-2 rounded-md p-2 w-48"
              onClick={() => {
                setShowOpen(false)
                handleNavigate('/dashboard/help')
              }}
         
        >
          Ask for help
        </button>
        
        
        

      </div>
    </div>
  )
}