import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { auth } from '../../firebase'
import { API_URL } from '../../api'

const CACHE_KEY_PREFIX = 'accountProfile_'

export const Navbar = () => {
  const [photoUrl, setPhotoUrl] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setPhotoUrl(null)
        return
      }

      // show the cached photo right away
      try {
        const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${user.uid}`)
        if (cached) setPhotoUrl(JSON.parse(cached).photoUrl || null)
      } catch (error) {
        console.error('Failed to read account cache:', error)
      }

      // then get the latest from the server
      try {
        const token = await user.getIdToken()
        const response = await fetch(`${API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (response.ok) setPhotoUrl(data.photo_url || null)
      } catch (error) {
        console.error('Navbar profile error:', error)
      }
    })

    return unsubscribe
  }, [])

  const resolvedPhotoUrl =
    photoUrl && photoUrl.startsWith('/uploads') ? `${API_URL}${photoUrl}` : photoUrl

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 theme-card">
      <div className="flex h-full items-center px-4 sm:px-8">
        <button className="flex flex-row items-center gap-2 py-6">
          <img src="/suitcase.png" alt="Suitcase" className="w-10 h-12" />
          <h1 className="font-mono text-md sm:text-lg md:text-lg">Expense Tracker</h1>
        </button>

        {/* hero */}
        <div className="ml-auto flex items-center gap-1">
          <div className="h-9 w-9 overflow-hidden rounded-full border border-white bg-blue-500">
            {resolvedPhotoUrl && (
              <img src={resolvedPhotoUrl} alt="Profile" className="h-full w-full object-cover" />
            )}
          </div>

          <button type="button" className="rounded-lg p-1 opacity-60 transition hover:opacity-100">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}