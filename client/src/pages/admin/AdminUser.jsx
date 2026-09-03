import React, { useState, useEffect } from 'react'
import { auth } from '../../firebase'
import { ShieldCheck, ShieldOff, Ban, CheckCircle2 } from 'lucide-react'

export const AdminUser = () => {
  const [loadingUser, setLoadingUser] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [busyId, setBusyId] = useState(null) // tracks which row is mid-action

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUser(true)
      const user = auth.currentUser
      if (!user) {
        setUsers([])
        return
      }
      const token = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const contentType = response.headers.get('content-type')
      let data = {}
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error(`Server returned ${response.status} instead of JSON`)
      }
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get users')
      }
      setUsers(data.users || [])
    } catch (error) {
      console.error('Fetch users error:', error)
      setUsers([])
    } finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchUsers()
    }
  }, [authLoading])

  // ==========================================
  // PROMOTE / DEMOTE ADMIN
  // ==========================================
  const handleTogglePromote = async (targetUser) => {
    try {
      setBusyId(targetUser.id)
      // TODO: call your backend, e.g. PATCH /api/users/:id/role
      console.log('toggle promote for', targetUser.id)
    } catch (error) {
      console.error('Promote error:', error)
    } finally {
      setBusyId(null)
    }
  }

  // ==========================================
  // BAN / UNBAN
  // ==========================================
  const handleToggleBan = async (targetUser) => {
    try {
      setBusyId(targetUser.id)
      // TODO: call your backend, e.g. PATCH /api/users/:id/status
      console.log('toggle ban for', targetUser.id)
    } catch (error) {
      console.error('Ban error:', error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-10 pt-10 ">
      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20 ">
        <h1 className="font-mono text-2xl">Manage user</h1>
      </div>

      <div className="overflow-y-auto pb-10">
        <table className="w-full border-collapse ">
          <thead>
            <tr className="text-left border theme-border-2 ">
              <th className="py-2 px-4">User</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingUser ? (
              <tr>
                <td colSpan={3} className="py-4">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4">No users found</td>
              </tr>
            ) : (
              users.map((details) => (
                <tr key={details.id}>
                  <td className="py-2 px-4">{details.name || details.email}</td>
                  <td className="py-2 pr-4">{details.role}</td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === details.id}
                        onClick={() => handleTogglePromote(details)}
                        title={details.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        className="p-2 border-2 border-black rounded-md disabled:opacity-40"
                      >
                        {details.role === 'admin' ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </button>
                      <button
                        disabled={busyId === details.id}
                        onClick={() => handleToggleBan(details)}
                        title={details.status === 'banned' ? 'Unban' : 'Ban'}
                        className="p-2 border-2 border-black rounded-md disabled:opacity-40"
                      >
                        {details.status === 'banned' ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}