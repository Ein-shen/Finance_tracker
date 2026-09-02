import React from 'react'


import { signOut, getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'


export const Adminsignout = () => {
  const navigate = useNavigate()
  const auth = getAuth()

  const handleSignOut= async () => {
    try{
      await signOut(auth)
      navigate('admin/admin-login')
    } catch (error) {
      console.error('Signout Error:', error)
    }
  }

  return (
    
    <div>
      <div>
        <button 
        onClick={handleSignOut}
        className='cursor-pointer bg-[#f3f3f3] hover:bg-white/10 rounded-md border border-2 p-2'>
          Signout
        </button>
      </div>
    </div>
  )
}
