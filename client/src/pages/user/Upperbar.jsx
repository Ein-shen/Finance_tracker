import React from 'react'
import { UserCircle } from 'lucide-react'

export const Upperbar = () => {
  return (
    <div className='flex flex-col'>
        <div className='border-b-2 w-full items-center'>
            <div className='p-4 flex flex-row items-center justify-between'>
                
                {/* Left side: logo + title */}
                <div className='flex flex-row items-center gap-2'>
                    <img
                        src="/suitcase.png"
                        alt="Suitcase"
                        className="w-10 h-12"
                    />
                    <h1 className='font-mono text-lg'>
                        Track ur Expenses
                    </h1>
                </div>

                {/* Right side: settings */}
                <h1 className='font-mono'>
                    <UserCircle  className="w-8 h-8" />
                </h1>

            </div>
        </div>
    </div>
  )
}
