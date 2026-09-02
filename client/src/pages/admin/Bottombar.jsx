import React from 'react'
import { House, Settings2 } from 'lucide-react'
import { User } from 'lucide-react'
import { Settings } from 'lucide-react'


export const Bottombar = () => {
  return (
    <div className='w-full  fixed bottom-0 p-4 flex flex justify-center items-center' >
        <div className='flex flex-row rounded-full border border-2 p-5 space-x-10'>
            <House />
            <User />
        
            <Settings />
        </div>
    </div>
  )
}
