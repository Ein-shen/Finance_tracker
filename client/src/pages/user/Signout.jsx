import React from 'react'
import { signOut, getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export const Signout = () => {
  const navigate = useNavigate()
  const auth = getAuth()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/login') // adjust to match your actual login route
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className='block w-full text-left px-3 py-2 hover:bg-gray-100 font-mono text-sm rounded-b-md'
    >
      Sign out
    </button>
  )
}