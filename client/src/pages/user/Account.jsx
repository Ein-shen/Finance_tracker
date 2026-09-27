import React, { useEffect, useState } from 'react'
import { Salary } from './Salary'
import { auth } from '../../firebase'
import { API_URL } from '../../api'

const CACHE_KEY_PREFIX = 'accountProfile_'

export const Account = () => {
  // Helper to build a per-user cache key
  const getCacheKey = (uid) => `${CACHE_KEY_PREFIX}${uid}`

  const saveCache = (uid, data) => {
    try {
      if (uid) {
        localStorage.setItem(getCacheKey(uid), JSON.stringify(data))
      }
    } catch (error) {
      console.error('Failed to save account cache:', error)
    }
  }

  // PROFILE - initialize from cache so something shows instantly.
  // We don't know the user yet at first render, so we peek at any cache
  // key present; it gets corrected/cleared once auth resolves.
  const [{ name: cachedName, email: cachedEmail, photoUrl: cachedPhotoUrl }] = useState(() => {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(CACHE_KEY_PREFIX)
      )
      if (keys.length === 0) return { name: '', email: '', photoUrl: null }
      const cached = localStorage.getItem(keys[0])
      return cached
        ? JSON.parse(cached)
        : { name: '', email: '', photoUrl: null }
    } catch {
      return { name: '', email: '', photoUrl: null }
    }
  })

  const [loadingProfile, setLoadingProfile] = useState(!cachedName && !cachedEmail)
  const [name, setName] = useState(cachedName || '')
  const [email, setEmail] = useState(cachedEmail || '')
  const [photoUrl, setPhotoUrl] = useState(cachedPhotoUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Load the cache for THIS specific user first (in case device is shared)
        try {
          const cached = localStorage.getItem(getCacheKey(user.uid))
          if (cached) {
            const parsed = JSON.parse(cached)
            setName(parsed.name || '')
            setEmail(parsed.email || '')
            setPhotoUrl(parsed.photoUrl || null)
            setLoadingProfile(false)
          }
        } catch (error) {
          console.error('Failed to read account cache:', error)
        }

        fetchProfile(user)
      } else {
        setLoadingProfile(false)
      }
    })
    return unsubscribe
  }, [])

  const fetchProfile = async (userArg) => {
    try {
      const user = userArg || auth.currentUser
      if (!user) return

      // Only show the blocking "loading" state if we don't already have
      // cached data on screen
      setLoadingProfile((prev) => (name || email ? false : prev))

      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile')
      }

      const freshName = data.name || ''
      const freshEmail = data.email || ''
      const freshPhotoUrl = data.photo_url || null

      setName(freshName)
      setEmail(freshEmail)
      setPhotoUrl(freshPhotoUrl)

      saveCache(user.uid, {
        name: freshName,
        email: freshEmail,
        photoUrl: freshPhotoUrl,
      })
    } catch (error) {
      console.error('Get profile error:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Create local object URL preview and track it
    const objectUrl = URL.createObjectURL(file)
    setPhotoUrl(objectUrl)
    setUploading(true)
    setUploadError(null)

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`${API_URL}/api/user/photo`, {
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

      // Cleanup local object preview memory allocation
      URL.revokeObjectURL(objectUrl)
      setPhotoUrl(data.user.photo_url)

      saveCache(user.uid, {
        name,
        email,
        photoUrl: data.user.photo_url,
      })
    } catch (error) {
      console.error('Photo upload error:', error)
      setUploadError('Failed to upload photo. Try again.')
    } finally {
      setUploading(false)
    }
  }

  // Handle absolute and relative paths cleanly using dynamic API_URL
  const resolvedPhotoUrl =
    photoUrl && photoUrl.startsWith('/uploads')
      ? `${API_URL}${photoUrl}`
      : photoUrl

  return (
    <div className="h-screen w-full">
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">
        <h1 className="font-mono text-lg sm:text-2xl theme-text">Account</h1>
      </div>

      <div className="w-full flex flex-col items-center pt-15 px-20">

        <div className='w-md theme-card flex flex-col items rounded-md flex  items-center py-10'>

        
            <label className="relative flex items-center justify-center border-2 rounded-md h-32 w-32 cursor-pointer overflow-hidden">
              {resolvedPhotoUrl ? (
                <img
                  src={resolvedPhotoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-mono text-sm text-center px-2">
                  {uploading ? 'Uploading...' : 'Profile'}
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

            <div className="flex flex-row items-center gap-4 pt-5">
              <h1 className="font-mono text-lg">
                {loadingProfile ? 'Name' : name || 'No name set'}
              </h1>
            </div>

            <h1 className="font-mono text-lg text-center mt-2">
              {loadingProfile ? 'Email' : email}
            </h1>
          </div>
        </div>

      <div className="theme-bg border-b theme-border pt-15" />

      <div className="flex flex-row pt-10 items-center justify-center">
        <Salary />
      </div>
    </div>
  )
}