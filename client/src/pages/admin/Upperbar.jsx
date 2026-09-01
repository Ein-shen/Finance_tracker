import React from 'react'
import { Adminsignout } from './Adminsignout'


export const Upperbar = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 flex items-center px-6 ">
      <div className="font-semibold text-gray-800 flex flex-row items-center">
        Welcome to Admin Dashboard


        <div className='fixed right-0 px-6'>
            <Adminsignout />
        </div>
        
        
      </div>
    </div>
  )
}