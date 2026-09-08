import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { API_URL } from '../../api'

const googleProvider = new GoogleAuthProvider()

// Helper to prevent double slashes in API endpoints
const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

// Sends the Firebase user's ID token to Express,
// which verifies it and inserts/updates the row in PostgreSQL
const syncUserToBackend = async (firebaseUser) => {
  const token = await firebaseUser.getIdToken()

  // Fixed: Safe path joining with baseUrl
  const response = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      name: firebaseUser.displayName || '',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to sync user with server')
  }

  return response.json()
}

export const Signup = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithPopup(auth, googleProvider)

      // Sync the new user to PostgreSQL
      await syncUserToBackend(result.user)

      navigate('/dashboard')
    } catch (error) {
      console.error('Google signup error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="theme-bg min-h-screen flex items-center justify-center overflow-y-auto py-8">
      <div className="theme-card p-8 rounded-xl shadow-md w-full max-w-md">

        {/* Logo / Welcome */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src="/suitcase.png"
            alt="Suitcase"
            className="w-16 h-16"
          />
        </div>

        <h1 className="text-2xl font-mono mb-6 text-center">
          Welcome to Finance Tracker
        </h1>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-5">
          <hr className="flex-1 border-gray-400" />

          <span className="mx-3 text-gray-500 text-sm">
            Continue with Auth
          </span>

          <hr className="flex-1 border-gray-400" />
        </div>

        <div>
          <h2 className="text-xl font-mono mb-6 text-center pb-10">
            Sign up now
          </h2>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-black py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 mt-4"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />

          Continue with Google
        </button>

        {/* Login */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-500 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup