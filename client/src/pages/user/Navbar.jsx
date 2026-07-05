import { useEffect, useRef, useState } from 'react'
import { ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react'
import { auth } from '../../firebase'
import { API_URL } from '../../api'
import { useNavigate } from 'react-router-dom'
import { Toogle, useTheme } from "./Toogle"
import { Star } from "lucide-react"


const CACHE_KEY_PREFIX = 'accountProfile_'

export const Navbar = () => {
  const navigate = useNavigate()

  // same theme logic as Settings
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [photoUrl, setPhotoUrl] = useState(null)
  const [showAccount, setShowAccount] = useState(false) // dropdown open/closed
  const menuRef = useRef(null)

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

  // close the dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!showAccount) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccount(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowAccount(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showAccount])

  const goTo = (path) => {
    setShowAccount(false)
    navigate(path)
  }

  const handleLogout = async () => {
    setShowAccount(false)
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const resolvedPhotoUrl =
    photoUrl && photoUrl.startsWith('/uploads') ? `${API_URL}${photoUrl}` : photoUrl

  const menuItems = [
    { label: 'Account', icon: User, onClick: () => goTo('/dashboard/account') },
    { label: 'Settings', icon: Settings, onClick: () => goTo('/dashboard/settings') },
    { label: 'Help', icon: HelpCircle, onClick: () => goTo('/dashboard/help') },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 theme-card">
      <div className="flex h-full items-center px-4 sm:px-8">
        <button className="flex flex-row items-center gap-2 py-6">
          <img src="/suitcase.png" alt="Suitcase" className="w-10 h-12" />
          <h1 className="font-mono text-md sm:text-lg md:text-lg">Expense Tracker</h1>
        </button>

        {/* profile + dropdown */}
        <div ref={menuRef} className="relative ml-auto flex items-center gap-3">


          
          <Toogle />

          <div className='flex flex-row'>
              <div
              onClick={() => navigate('/dashboard/account')}
              className="h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-white bg-blue-500"
            >
              {resolvedPhotoUrl && (
                <img src={resolvedPhotoUrl} alt="Profile" className="h-full w-full object-cover" />
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAccount((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={showAccount}
              className="rounded-lg p-1 opacity-60 transition hover:opacity-100"
            >
              <ChevronDown
                size={20}
                className={`transition-transform duration-200 ${showAccount ? 'rotate-180' : ''}`}
              />
            </button>
            

          </div>
          

          {showAccount && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-white/10 theme-card shadow-lg"
            >
              {menuItems.map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={onClick}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/10"
                >
                  <Icon size={16} className="opacity-70" />
                  {label}
                </button>
              ))}

      

             

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-white/10"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}