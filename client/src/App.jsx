import './index.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { API_URL } from './api.js'
// ==========================================
// USER IMPORTS
// ==========================================

import { Home } from './pages/Home'
import { Dashboard } from './pages/user/Dashboard'
import { Login } from './pages/user/Login'
import { Signup } from './pages/user/Signup'
import { Transaction } from './pages/user/Transaction'
import { Account } from './pages/user/Account.jsx'
import { Schedule } from './pages/user/Schedule.jsx'
import { Analytics } from './pages/user/Analytics.jsx'
import { Index } from './pages/user/index'
import { Settings } from './pages/user/Settings'
import { About } from './pages/user/About.jsx'
import { Support } from './pages/user/Support.jsx'
import { Help } from './pages/user/Help.jsx'

// ==========================================
// ADMIN IMPORTS
// ==========================================
import { Adminlogin } from './pages/admin/Adminlogin.jsx'
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx'
import { AdminHome } from './pages/admin/AdminHome.jsx'
import { AdminUser } from './pages/admin/AdminUser.jsx'
import { AdminSettings } from './pages/admin/AdminSettings.jsx'
import { AdminAnalytics } from './pages/admin/AdminAnalytics.jsx'
import { Manage } from './pages/admin/Manage.jsx'

// ==========================================
// COMPONENT IMPORTS
// ==========================================

import { BarChartComponent } from './components/BarChartComponent.jsx'

// ==========================================
// LOADING SCREEN
// ==========================================
import { HashLoader } from "react-spinners"

function LoadingScreen({ loading }) {
  return (
    <div className="min-h-screen theme-bg flex flex-row items-center justify-center gap-2">
      <HashLoader
        loading={loading}
        size={20}
        color="#dddfe9"
      />
      <span className="font-mono text-md">
        Initializing ExpenseKontrol...
      </span>
    </div>
  )
}

// ==========================================
// APP
// ==========================================

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [authLoading, setAuthLoading] = useState(true) // waits for Firebase only
  const [roleLoading, setRoleLoading] = useState(false) // waits for /api/users/role

  // ==========================================
  // FIREBASE AUTH STATE
  // ==========================================

  useEffect(() => {
    let cancelled = false

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Not logged in: nothing else to wait for
      if (!user) {
        setSession(null)
        setRole(null)
        setRoleLoading(false)
        setAuthLoading(false)
        return
      }

      // Firebase has answered, so show the app now.
      // The role is fetched in the background.
      setSession(user)
      setRoleLoading(true)
      setAuthLoading(false)

      try {
        const idToken = await user.getIdToken() // no forced refresh

        // ========================================
        // GET ROLE FROM BACKEND
        // ========================================
        const response = await fetch(`${API_URL}/api/users/role`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        if (cancelled) return

        // Banned users
        if (response.status === 403) {
          await auth.signOut()
          setSession(null)
          setRole(null)
          alert('Your account has been banned.')
          return
        }

        if (!response.ok) {
          setRole('user')
          return
        }

        const data = await response.json()
        if (!cancelled) setRole(data.role || 'user')
      } catch (error) {
        console.error('Authentication / role error:', error)
        if (!cancelled) setRole('user')
      } finally {
        if (!cancelled) setRoleLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  // Only blocks on Firebase restoring the session (~600 ms)
  if (authLoading) {
    return <LoadingScreen />
  }

  // ==========================================
  // ADMIN ROUTE GUARD
  // Only admin routes wait for the role
  // ==========================================
  const adminOnly = (element) => {
    if (session && roleLoading) return <LoadingScreen />
    return session && role === 'admin'
      ? element
      : <Navigate to="/admin-login" replace />
  }

  const adminLoginElement = () => {
    if (session && roleLoading) return <LoadingScreen />
    return session && role === 'admin'
      ? <Navigate to="/admin/admindashboard" replace />
      : <Adminlogin />
  }

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* USER DASHBOARD */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Index />} />
        <Route path="transaction" element={<Transaction />} />
        <Route path="settings" element={<Settings />} />
        <Route path="account" element={<Account />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />} />
        <Route path="support" element={<Support />} />
        <Route path="barchart" element={<BarChartComponent />} />
      </Route>

      {/* ADMIN LOGIN */}
      <Route path="/admin-login" element={adminLoginElement()} />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin/admindashboard"
        element={adminOnly(<AdminDashboard />)}
      >
        <Route index element={<AdminHome />} />
        <Route path="adminhome" element={<AdminHome />} />
        <Route path="user" element={<AdminUser />} />
        <Route path="adminanalytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="manage" element={<Manage />} />
      </Route>

      {/* ADMIN REDIRECT */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/admindashboard" replace />}
      />

      {/* FALLBACK ROUTE */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App