import React from 'react'
import { signOut, getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { User2Icon } from 'lucide-react'

export const Adminsignout = () => {
  const navigate = useNavigate()
  const auth = getAuth()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/admin-login')
    } catch (error) {
      console.error('Signout Error:', error)
    }
  }

  return (
    <div>
      <div>
        <button
          onClick={handleSignOut}
          className='theme-bg theme-hover cursor-pointer  flex flex-row '
        >
          <LogOut size={20} />
          
        </button>
      </div>
    </div>
  )
}