import React from 'react'
import { House } from 'lucide-react'

export const Bottombar = () => {
  return (
    <div className='w-full  fixed bottom-0 p-4 flex flex justify-center items-center' >
        <div className='flex flex-row rounded-full border border-2 p-5 space-x-4'>
            <House />
            <h1> Bottom bar</h1>
        </div>
    </div>
  )
}
