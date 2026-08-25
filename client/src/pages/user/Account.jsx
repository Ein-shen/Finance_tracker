import React, { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { auth } from '../../firebase'

export const Account = () => {
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile()
      } else {
        setLoadingProfile(false)
      }
    })
    return unsubscribe
  }, [])

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true)
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile')
      }

      setName(data.name || '')
      setEmail(data.email || '')
    } catch (error) {
      console.error('Get profile error:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  return (
    <div className='w-full'>
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">
        <h1 className="font-mono text-lg sm:text-2xl theme-text">Account</h1>
      </div>

      <div className="flex flex-col items-center pt-15">
        <div className="flex items-center justify-center border-2 rounded-md h-32 w-32">
          {/* Image or icon here */}
        </div>

        <div className='flex flex-row items-center gap-4 pt-5'>
          <h1 className="font-mono text-lg">
            {loadingProfile ? '...' : name || 'No name set'}
          </h1>
          <span className="flex items-center">
            <Pencil size={15} />
          </span>
        </div>

        <h1 className="font-mono text-lg text-center mt-2">
          {loadingProfile ? '...' : email}
        </h1>
      </div>
    </div>
  )
}