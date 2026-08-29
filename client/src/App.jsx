import './index.css'
import { Routes, Route } from 'react-router-dom'

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


import { SalesChart } from './components/SalesChart.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
      </Route>
    </Routes>
  )
}

export default App