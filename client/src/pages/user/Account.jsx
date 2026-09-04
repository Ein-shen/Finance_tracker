import React, { useEffect, useState } from 'react'
import { Salary } from './Salary'
import { auth } from '../../firebase'

export const Account = () => {
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)



 
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
      setPhotoUrl(data.photo_url || null)
    } catch (error) {
      console.error('Get profile error:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // instant local preview while uploading
    setPhotoUrl(URL.createObjectURL(file))
    setUploading(true)
    setUploadError(null)

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('http://localhost:5000/api/user/photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo')
      }

      setPhotoUrl(data.user.photo_url)
    } catch (error) {
      console.error('Photo upload error:', error)
      setUploadError('Failed to upload photo. Try again.')
    } finally {
      setUploading(false)
    }
  }

  // DB paths look like /uploads/123.png and need the server prefix.
  // A freshly picked file preview is already a blob: URL and needs no prefix.
  const resolvedPhotoUrl =
    photoUrl && photoUrl.startsWith('/uploads')
      ? `http://localhost:5000${photoUrl}`
      : photoUrl

  return (
    <div className='w-full'>
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">
        <h1 className="font-mono text-lg sm:text-2xl theme-text">Account</h1>
      </div>

      <div className="flex flex-col items-center pt-15">
        <label className="relative flex items-center justify-center border-2 rounded-md h-32 w-32 cursor-pointer overflow-hidden">
          {resolvedPhotoUrl ? (
            <img
              src={resolvedPhotoUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-mono text-sm text-center px-2">
              {uploading ? 'Uploading...' : 'Add photo'}
            </span>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {uploadError && (
          <p className="font-mono text-sm text-red-500 mt-2">{uploadError}</p>
        )}

        <div className='flex flex-row items-center gap-4 pt-5'>
          <h1 className="font-mono text-lg">
            {loadingProfile ? '...' : name || 'No name set'}
          </h1>
        
        </div>

        <h1 className="font-mono text-lg text-center mt-2">
          {loadingProfile ? '...' : email}
        </h1>
      </div>
      

      <div className=' pt-15'/>


        <div className='flex flex-row pt-10 items-center justify-center '>
           <Salary />
        </div>
       
      
      
    </div>
  )
}