import './index.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react' // Import state hooks if managing auth here

// User Imports
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

// Admin Imports (Matching your file structure)
import { Adminlogin } from './pages/admin/Adminlogin.jsx'
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx'
// import AdminLayout from './pages/admin/AdminLayout.jsx' // Make sure AdminLayout exists if you wrap children in it

import { SalesChart } from './components/SalesChart.jsx'
import { BarChartComponent } from './components/BarChartComponent.jsx'

function App() {
  // Replace these with your actual Auth State or Context hook (e.g., Supabase / Firebase session)
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null) // e.g., 'admin', 'user', or null while loading

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* User Area */}
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
        <Route path="saleschart" element={<SalesChart />} />
        <Route path="barchart" element={<BarChartComponent />} />
      </Route>

      {/* Admin Login */}
      <Route
        path="/admin-login"
        element={
          session && role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <Adminlogin />
          )
        }
      />

      {/* Admin Area */}
      <Route
        path="/admin"
        element={
          !session ? (
            <Navigate to="/admin-login" replace />
          ) : role === null ? (
            <div className="min-h-screen flex items-center justify-center bg-gray-300">
              <p className="text-lg text-gray-500">Loading...</p>
            </div>
          ) : role === 'admin' ? (
            <AdminDashboard /> // Replace with <AdminLayout /> if you have a layout wrapper with an <Outlet />
          ) : (
            <Navigate to="/admin-login" replace />
          )
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="adminDashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App