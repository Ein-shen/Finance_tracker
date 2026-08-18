import React from 'react'
import {User} from 'lucide-react'

export const Sidebar = () => {
  return (

    <div className='flex flex-col'>
        <div className='h-screen w-48 border-r-2 border-black left-0 items-center text-center space-y-2 p-2'>
            <h1 className='font-mono text-md border border-2 rounded-md p-2'>
                schedule 
            </h1>
             <h1 className='font-mono text-md  border border-2 rounded-md p-2'>
                Analytics 
            </h1>
             
             <h1 className='font-mono text-md border border-2 rounded-md p-2'>
                 Account 
            </h1>

        </div>
    </div>
  )
}
