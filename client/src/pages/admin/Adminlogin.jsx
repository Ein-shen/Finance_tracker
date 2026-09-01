
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'

const googleProvider = new GoogleAuthProvider()

export const Adminlogin = () => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // ==========================================
  // HANDLE GOOGLE REDIRECT RESULT
  // ==========================================

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getRedirectResult(auth)

        // No redirect result means normal page load
        if (!result) {
          setLoading(false)
          return
        }

        const user = result.user

        console.log('Google login successful:', user.email)

        // ==========================================
        // GET FIREBASE ID TOKEN
        // ==========================================

        const idToken = await user.getIdToken()

        // ==========================================
        // SAVE / UPDATE USER IN POSTGRESQL
        // ==========================================

        const saveRes = await fetch(
          'http://localhost:5000/api/users',
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              token: idToken,
              name: user.displayName || '',
            }),
          }
        )

        if (!saveRes.ok) {
          const data = await saveRes
            .json()
            .catch(() => null)

          throw new Error(
            data?.message ||
              'Failed to save user'
          )
        }

        // ==========================================
        // CHECK USER ROLE
        // ==========================================

        const roleRes = await fetch(
          'http://localhost:5000/api/users/role',
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        )

        if (!roleRes.ok) {
          const data = await roleRes
            .json()
            .catch(() => null)

          throw new Error(
            data?.message ||
              'Failed to check role'
          )
        }

        const roleData = await roleRes.json()

        console.log('User role:', roleData.role)

        // ==========================================
        // ADMIN CHECK
        // ==========================================

        if (roleData.role === 'admin') {
          navigate('/admin', {
            replace: true,
          })
        } else {
          await auth.signOut()

          setError(
            'This account does not have admin access.'
          )
        }
      } catch (err) {
        console.error(
          'Admin login error:',
          err
        )

        setError(
          err.message ||
            'Something went wrong during login.'
        )
      } finally {
        setLoading(false)
      }
    }

    handleRedirectResult()
  }, [navigate])

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogle = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      await signInWithRedirect(
        auth,
        googleProvider
      )
    } catch (err) {
      console.error(
        'Google redirect error:',
        err
      )

      setError(
        err.message ||
          'Unable to start Google login.'
      )

      setLoading(false)
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-y-auto py-8">

      <div className="bg-[#f3f3f3] text-gray-900 p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">

        {/* ICON */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src="/suitcase.png"
            alt="Suitcase"
            className="w-16 h-16"
          />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-mono mb-6 text-center">
          Welcome to Finance Tracker
        </h1>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* DIVIDER */}
        <div className="flex items-center my-5">

          <hr className="flex-1 border-gray-400" />

          <span className="mx-3 text-gray-500 text-sm">
            Continue with Auth
          </span>

          <hr className="flex-1 border-gray-400" />

        </div>

        {/* ADMIN TITLE */}
        <h2 className="text-xl font-mono mb-6 text-center pb-10">
          Login as Admin
        </h2>

        {/* GOOGLE BUTTON */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-black text-gray-900 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 mt-4"
        >

          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />

          {loading
            ? 'Redirecting...'
            : 'Continue with Google'}

        </button>

      </div>

    </div>
  )
}

