import React, { useState } from 'react'
import { UserCircle } from 'lucide-react'
import { Profiledrop } from './Profiledrop'

export const Upperbar = () => {
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    // do something with `query`
  }

  return (
    <div className='fixed top-0 left-64 right-0 py-2'>
      <div className='p-4 flex flex-row items-center justify-between gap-4'>

        {/* Left side: logo + title */}
        <div />

        
        <form onSubmit={handleSearch} className="flex flex-row items-center space-x-2 flex-1 max-w-md">
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search'
            className='rounded-lg pl-10 py-2 px-3 w-full font-mono'
            style={{ border: '2px solid var(--text-color)', color: 'var(--text-color)' }}
          />
          <button
            type='submit'
            className='font-mono rounded-lg px-4 py-2 hover:bg-gray-100'
            style={{ border: '2px solid var(--text-color)' }}
          >
            Enter
          </button>
        </form>

        {/* Right side: settings */}
        <div className='flex items-center   pr-5'>
          <div className='flex items-center pr-5'>
            <Profiledrop>
              <UserCircle className="w-10 h-10 hover:bg-gray-100 rounded-full hover:text-black " />
            </Profiledrop>
          </div>

          
        </div>
      </div>
    </div>
  )
}