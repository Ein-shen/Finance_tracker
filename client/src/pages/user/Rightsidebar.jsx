import React, { useState } from 'react'
import { UserCircle } from 'lucide-react'
import { Profiledrop } from './Profiledrop'

export const Rightsidebar = () => {
  return (
    <div className='h-screen w-16 right-0 fixed'>
      <div className='border-l-2 p-4 flex flex-col h-screen items-center justify-start gap-4'>

        <div className='flex items-center'>
          <Profiledrop>
            <UserCircle className="w-10 h-10 hover:bg-gray-100 rounded-full hover:text-black" />
          </Profiledrop>
        </div>

      </div>
    </div>
  )
}