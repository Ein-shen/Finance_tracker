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
    <div className="flex flex-col gap-20">

      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20">
        <h1 className="font-mono text-2xl">
          Settings
        </h1>
      </div>

      <div className=" theme-card py-4 space-y-4 theme-border border px-3 rounded-md w-[70%] mx-auto flex flex-col justify-center items-stretch">
  
        

        {/* About Button */}
        <button 
          className="w-full border-b pb-4 px-6 gap-1 sm:px-8 md:px-12 lg:px-5 font-mono text-md transition-colors hover:opacity-80 flex items-center justify-between"
          onClick={() => {
            setShowOpen(false)
            handleNavigate('/dashboard/about')
          }}
        >
          
          <span className='flex flex-row item-center gap-2'>
            <img src="https://img.icons8.com/?size=100&id=PUULuXvUfB6u&format=png&color=000000" alt="set" height={10} width={20} />
            About</span>
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
          <span className='flex flex-row item-center gap-2'>
            <img src="https://img.icons8.com/?size=100&id=CKanVNIbMiJO&format=png&color=000000" alt="sup" height={10} width={20} />
            Support</span>
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
          <span className='flex flex-row item-center gap-2'>
            <img src="https://img.icons8.com/?size=100&id=wYfd7Y8cWmet&format=png&color=000000" alt="ask" height={10} width={20}/>
            Ask for help </span>
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
          <span className='flex flex-row item-center gap-2'>
            <img src="https://img.icons8.com/?size=100&id=ceTqKjlDTFsp&format=png&color=000000" alt="lang" height={10} width={20} />
            Language</span>
          <ChevronRight size={25} />
        </button>

        
        
      </div>
    </div>
  )
}