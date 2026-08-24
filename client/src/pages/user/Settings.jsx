import React from 'react'
import { Toogle, useTheme } from "./Toogle"
import { Sun, Moon } from 'lucide-react'

export const Settings = () => {
  const { theme } = useTheme()

  const isLight = theme === 'light'

  return (
    <div className="flex flex-col gap-10">

      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20">
        <h1 className="font-mono text-xl">
          Settings
        </h1>
      </div>

      <div className="pt-10 flex flex-col items-center md:items-start gap-4 px-4 sm:px-8 md:px-12 lg:px-20">

        <div className="border-2 rounded-md w-48 flex flex-row p-2 gap-3">
          <span className="flex gap-2 font-mono justify-center md:justify-start">
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

        <div className="border-2 rounded-md p-2 w-48">
          <h1 className="font-mono text-md text-center">
            About
          </h1>
        </div>

        <div className="border-2 rounded-md p-2 w-48">
          <h1 className="font-mono text-md text-center">
            Support
          </h1>
        </div>

        <div className="border-2 rounded-md p-2 w-48">
          <h1 className="font-mono text-md text-center">
            Help
          </h1>
        </div>

      </div>
    </div>
  )
}