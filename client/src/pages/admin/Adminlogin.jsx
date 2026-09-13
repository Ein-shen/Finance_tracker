
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { API_URL } from '../../api'

const googleProvider = new GoogleAuthProvider()

export const Adminlogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // ==========================================
  // PROCESS ADMIN AUTHENTICATION
  // ==========================================
  const processAdminAuth = async (user) => {
    try {
      console.log('=================================')
      console.log('ADMIN AUTHENTICATION STARTED')
      console.log('=================================')

      console.log('1. Firebase user:', user.email)
      console.log('2. Firebase UID:', user.uid)

      // Get Firebase ID Token
      const idToken = await user.getIdToken()

      console.log('3. Firebase ID token received')

      // ==========================================
      // SAVE / UPDATE USER IN POSTGRESQL
      // ==========================================

      console.log('4. Saving user to backend...')
      console.log('API URL:', API_URL)
      console.log('Endpoint:', `${API_URL}/api/users`)

      const saveRes = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: idToken,
          name: user.displayName || '',
        }),
      })

      console.log('5. /api/users status:', saveRes.status)

      const saveData = await saveRes.json().catch(() => null)

      console.log('6. /api/users response:', saveData)

      if (!saveRes.ok) {
        throw new Error(
          saveData?.message || 'Failed to save user to database.'
        )
      }

      // ==========================================
      // CHECK USER ROLE
      // ==========================================

      console.log('7. Checking user role...')

      const roleRes = await fetch(`${API_URL}/api/users/role`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      console.log('8. /api/users/role status:', roleRes.status)

      const roleData = await roleRes.json().catch(() => null)

      console.log('9. ROLE RESPONSE:', roleData)

      if (!roleRes.ok) {
        throw new Error(
          roleData?.message || 'Failed to check user role.'
        )
      }

      // ==========================================
      // CHECK ADMIN ROLE
      // ==========================================

      if (roleData.role === 'admin') {
        console.log('10. ADMIN CONFIRMED!')
        console.log('Redirecting to /admin')

        navigate('/admin/admindashboard', { replace: true })

      } else {
        console.log('10. USER IS NOT ADMIN')
        console.log('Current role:', roleData.role)

        // Sign out non-admin users
        await auth.signOut()

        throw new Error(
          'This account does not have admin access.'
        )
      }

    } catch (error) {
      console.error('=================================')
      console.error('ADMIN AUTH ERROR')
      console.error('=================================')
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Full error:', error)

      throw error
    }
  }

  // ==========================================
  // EMAIL / PASSWORD LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      console.log('EMAIL LOGIN STARTED')

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      console.log(
        'EMAIL LOGIN SUCCESSFUL:',
        userCredential.user.email
      )

      await processAdminAuth(userCredential.user)

      setEmail('')
      setPassword('')

    } catch (err) {
      console.error('EMAIL LOGIN ERROR:', err)

      setError(
        err.message || 'Something went wrong during login.'
      )

    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================
  const handleGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('=================================')
      console.log('GOOGLE LOGIN STARTED')
      console.log('=================================')

      const result = await signInWithPopup(
        auth,
        googleProvider
      )

      console.log('GOOGLE LOGIN SUCCESSFUL')
      console.log('Google user:', result.user.email)
      console.log('Google UID:', result.user.uid)

      await processAdminAuth(result.user)

    } catch (err) {
      console.error('=================================')
      console.error('GOOGLE LOGIN ERROR')
      console.error('=================================')
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      console.error('Full error:', err)

      setError(
        err.message || 'Something went wrong during Google login.'
      )

    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // UI
  // ==========================================
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
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm break-words">
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

        {/* Admin Login Title */}
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
          className="w-full border border-black py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 mt-4"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />

          {loading
            ? 'Authenticating...'
            : 'Continue with Google'}
        </button>

      </div>
    </div>
  )
}
