import React from 'react'

export const Adminlogin = () => {
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
            Admin
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

          Continue with Google
        </button>

        {/* Signup */}
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
