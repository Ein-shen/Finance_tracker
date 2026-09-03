import React from 'react'



export const Upperbar = () => {
  return (
    <div className="theme-bg fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 flex items-center px-6 ">
      <div className="font-semibold text-gray-800 flex flex-row items-center theme-text">
        
        <img src="/suitcase.png" alt="Admin" className="w-10 h-10 ml-2" />
        <span className='text-2xl font-mono'>Admin</span>


        <div className='fixed right-0 px-6'>
            
        </div>
        
        
      </div>
    </div>
  )
}