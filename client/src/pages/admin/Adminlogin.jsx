import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export const Adminlogin = () => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: wire up your actual Google auth logic here
      // e.g. await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-[#f3f3f3] text-gray-900 p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">

        {/* Logo / Welcome */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src="/suitcase.png"
            alt="Suitcase"
            className="w-16 h-16"
          />
        </div>

        <h1 className="text-2xl font-mono mb-6 text-center text-gray-900">
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
          <h2 className="text-xl font-mono mb-6 text-center pb-10 text-gray-900">
            Login as Admin
          </h2>
        </div>

        {/* Google Login */}
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
          Continue with Google
        </button>

        {/* Signup */}
        

      </div>
    </div>
  )
}