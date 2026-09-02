import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import { getAuth, getRedirectResult, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth' 

const googleProvider = new GoogleAuthProvider()

export const Adminlogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // Helper method to verify backend status & role after authentication
  const processAdminAuth = async (user) => {
    const idToken = await user.getIdToken()

    // 1. Save / Update User in PostgreSQL
    const saveRes = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: idToken,
        name: user.displayName || '',
      }),
    })

    if (!saveRes.ok) {
      const data = await saveRes.json().catch(() => null)
      throw new Error(data?.message || 'Failed to save user')
    }

    // 2. Check User Role
    const roleRes = await fetch('http://localhost:5000/api/users/role', {
      method: 'GET',
      headers: { Authorization: `Bearer ${idToken}` },
    })

    if (!roleRes.ok) {
      const data = await roleRes.json().catch(() => null)
      throw new Error(data?.message || 'Failed to check role')
    }

    const roleData = await roleRes.json()

    // 3. Confirm Admin authorization
    if (roleData.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      await auth.signOut()
      throw new Error('This account does not have admin access.')
    }
  }

  // Handle Standard Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await processAdminAuth(userCredential.user)

      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message || 'Something went wrong during login.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google Popup Login
  const handleGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      await processAdminAuth(result.user)
    } catch (err) {
      setError(err.message || 'Something went wrong during login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-y-auto py-8">
      <div className="p-8 rounded-xl shadow-md w-full max-w-md">

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
            Admin Login
          </h2>
        </div>

       

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-black py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 mt-4"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          {loading ? 'Authenticating...' : 'Continue with Google'}
        </button>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-500 hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Adminlogin