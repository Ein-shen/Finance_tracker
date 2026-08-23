import React from 'react'
import { Toogle, useTheme } from "./Toogle"
import { Sun, Moon } from 'lucide-react'

export const Settings = () => {
  const { theme } = useTheme()

  const isLight = theme === 'light'

  return (
    <div className="flex flex-col gap-10">

      <div className="flex flex-row">
        <h1 className="font-mono text-2xl pl-20">
          Settings
        </h1>
      </div>

      <div className=" pl-20 flex items-center gap-4 pl-20 mt-6 flex flex-col gap-4  ">

        <div className='border border-2 rounded-md  w-48 flex flex-row p-2 gap-3'>

          <span className="flex items-center gap-2 font-mono">
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
        <div className='border border-2 rounded-md p-2 w-48'>
          <h1 className='font-mono text-md text-center'>
            About 
          </h1>
        </div>
        

      </div>

    </div>
  )
}