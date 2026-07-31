import React, { useEffect, useState } from 'react'
import { Salary } from './Salary'
import { auth } from '../../firebase'
import { API_URL } from '../../api'

// This prefix is used to name the localStorage key for each user, like:
// "accountProfile_" + their unique Firebase ID (uid)
// Example final key: "accountProfile_aBc123xyz"
const CACHE_KEY_PREFIX = 'accountProfile_'

export const Account = () => {
  // ==========================================
  // SMALL HELPER FUNCTIONS FOR LOCALSTORAGE
  // ==========================================

  // Turns a user's uid into their unique localStorage key.
  // Example: getCacheKey("aBc123") -> "accountProfile_aBc123"
  const getCacheKey = (uid) => `${CACHE_KEY_PREFIX}${uid}`

  // Saves the profile data (name, email, photoUrl) into localStorage
  // so it can be loaded instantly next time, without waiting on the server.
  const saveCache = (uid, data) => {
    try {
      if (uid) {
        // JSON.stringify turns the {name, email, photoUrl} object into text,
        // because localStorage can only store strings.
        localStorage.setItem(getCacheKey(uid), JSON.stringify(data))
      }
    } catch (error) {
      // This can fail if localStorage is full or blocked by the browser.
      console.error('Failed to save account cache:', error)
    }
  }

  // ==========================================
  // LOAD CACHED PROFILE IMMEDIATELY (BEFORE LOGIN CHECK FINISHES)
  // ==========================================
  // This runs ONCE, the very first time the component renders.
  // At this exact moment we don't know WHICH user is logged in yet
  // (Firebase hasn't told us), so we just grab whatever cached profile
  // happens to already be sitting in localStorage. This lets the page
  // show something immediately, instead of a blank "loading" screen.
  // A few lines below, once Firebase confirms who the user actually is,
  // we double check and correct this if needed.
  const [{ name: cachedName, email: cachedEmail, photoUrl: cachedPhotoUrl }] = useState(() => {
    try {
      // Find any localStorage key that starts with "accountProfile_"
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(CACHE_KEY_PREFIX)
      )

      // Nothing cached yet (e.g. first time ever using the app)
      if (keys.length === 0) return { name: '', email: '', photoUrl: null }

      // Read whatever we found and turn the text back into an object
      const cached = localStorage.getItem(keys[0])
      return cached
        ? JSON.parse(cached)
        : { name: '', email: '', photoUrl: null }
    } catch {
      // If anything goes wrong (corrupted data, etc.), just start empty
      return { name: '', email: '', photoUrl: null }
    }
  })

  // ==========================================
  // REACT STATE (what the component actually displays)
  // ==========================================
  // We seed these with whatever we found in the cache above, so the
  // very first render already shows real data instead of "Name" / "Email".

  // Only show the big "loading..." state if we truly have nothing cached.
  // If we already have a cached name/email, skip straight to showing it.
  const [loadingProfile, setLoadingProfile] = useState(!cachedName && !cachedEmail)

  const [name, setName] = useState(cachedName || '')
  const [email, setEmail] = useState(cachedEmail || '')
  const [photoUrl, setPhotoUrl] = useState(cachedPhotoUrl || null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // ==========================================
  // WAIT FOR FIREBASE TO TELL US WHO IS LOGGED IN
  // ==========================================
  useEffect(() => {
    // onAuthStateChanged fires once when the app loads, and again anytime
    // the user logs in or out.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Now that we know exactly WHO is logged in, check if there is a
        // saved cache specifically for THIS person's uid (in case someone
        // else used this browser before and their data got peeked earlier).
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

        // Whether or not we had a cache, always fetch the latest data
        // from the server too, so the info stays accurate/up to date.
        // Note: if the server/database is unreachable (like the Neon
        // connection error you saw earlier), this fetch will fail and
        // get caught below — but it will NOT crash the page, because
        // we already have cached data showing from the block above.
        fetchProfile(user)
      } else {
        // Nobody is logged in
        setLoadingProfile(false)
      }
    })

    // Cleanup: stop listening when this component unmounts
    return unsubscribe
  }, [])

  // ==========================================
  // GET PROFILE FROM THE SERVER (source of truth)
  // ==========================================
  const fetchProfile = async (userArg) => {
    try {
      const user = userArg || auth.currentUser
      if (!user) return

      // If we already have something on screen (from cache), don't show
      // the big blocking "loading" state again while we refresh in the
      // background. Only show it if the screen is truly empty.
      setLoadingProfile((prev) => (name || email ? false : prev))

      // Get a fresh auth token to prove to our backend who we are
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

      // Pull out the fields we care about from the server's response
      const freshName = data.name || ''
      const freshEmail = data.email || ''
      const freshPhotoUrl = data.photo_url || null

      // Update what's shown on screen
      setName(freshName)
      setEmail(freshEmail)
      setPhotoUrl(freshPhotoUrl)

      // Save this fresh data to localStorage so next time the page loads,
      // it can show this instantly before even asking the server again.
      saveCache(user.uid, {
        name: freshName,
        email: freshEmail,
        photoUrl: freshPhotoUrl,
      })
    } catch (error) {
      // If the server/database is down (e.g. ENOTFOUND from Neon), we land
      // here. We just log it and quietly keep showing whatever cached data
      // is already on screen instead of breaking the page.
      console.error('Get profile error:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  // ==========================================
  // UPLOAD A NEW PROFILE PHOTO
  // ==========================================
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show an instant local preview of the picked photo before it's
    // even uploaded, using a temporary browser-only URL.
    const objectUrl = URL.createObjectURL(file)
    setPhotoUrl(objectUrl)
    setUploading(true)
    setUploadError(null)

    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()

      // Photos are sent as multipart form data, not JSON
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

      // Free up the temporary local preview URL, we don't need it anymore
      URL.revokeObjectURL(objectUrl)

      // Use the real photo URL returned by the server
      setPhotoUrl(data.user.photo_url)

      // Update the cache with the new photo too, so it's remembered
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

  // Our server sometimes returns a relative path like "/uploads/photo.jpg"
  // instead of a full URL. If so, stick our API_URL in front of it so the
  // <img> tag knows where to actually fetch it from.
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

        
            {/* Clicking the photo opens the file picker (the hidden <input> below) */}
            <label className="relative flex items-center justify-center border-b border-white/5 rounded-md h-32 w-32 cursor-pointer overflow-hidden">
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

     
    </div>
  )
}