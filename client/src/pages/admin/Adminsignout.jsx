import React, { useState } from 'react'
import { signOut, getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { X, ChevronRight } from 'lucide-react'

export const Adminsignout = () => {
  const navigate = useNavigate()
  const auth = getAuth()
  const [confirmationLogout, setConfirmationLogout] = useState(false)

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
      {confirmationLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmationLogout(false)}
          />

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6 theme-card theme-text theme-border">
            <div className="relative flex items-center justify-between mb-6">
              <h2 className="font-mono text-md">
                Are you sure to Logout in Admin?
              </h2>

              <button
                type="button"
                onClick={() => setConfirmationLogout(false)}
                className="absolute right-0 top-0 theme-text theme-hover rounded-md p-1 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                onClick={() => setConfirmationLogout(false)}
                className="w-full border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full bg-red-600 border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                Signout
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setConfirmationLogout(true)}
        className="w-full px-6 sm:px-8 md:px-12 lg:px-5 font-mono text-md transition-colors hover:opacity-80 flex items-center justify-between"
      >
        Admin Sign out
        <ChevronRight />
      </button>
    </div>
  )
}