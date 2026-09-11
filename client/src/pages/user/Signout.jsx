import React from 'react'
import { signOut, getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
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
      className=' w-full  sm:px-8 md:px-12 lg:px-5 font-mono text-md transition-colors hover:opacity-80 flex items-center justify-between'
    >
      Sign out
      <ChevronRight size={25} />
      
    </button>
  )
}