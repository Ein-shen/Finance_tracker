import React, { useState, useRef, useEffect } from 'react'
import { UserCircle } from 'lucide-react'
import { Toogle } from './Toogle'
import { Signout } from './Signout'

export const Profiledrop = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='relative' ref={ref}>
      <UserCircle
        className="w-10 h-10 hover:bg-gray-100 rounded-full cursor-pointer"
        onClick={() => setOpen(!open)}
      />
      
        <div className='pr-10'>
            {open && (
              <div 
                className='absolute right-0 mt-2 w-40 border-2 rounded-md shadow-md z-50 border-[var(--text-color)] bg-[var(--bg-color)]'
              >
                
                <div className='rounded-t-md flex items-center justify-between w-full px-3 py-2 hover:bg-gray-100 hover:text-black font-mono text-sm cursor-default border-b-2'>
                  Night Mode
                  <Toogle />
                </div>
                <Signout />

              </div>
           
          )}
      </div>
    </div>
  )
}