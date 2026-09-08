import React, { useState, useEffect } from 'react'
import { auth } from '../../firebase'
import { Ban, CheckCircle2 } from 'lucide-react'
import { API_URL } from '../../api'

export const AdminUser = () => {
  const [loadingUser, setLoadingUser] = useState(true)
  const [users, setUsers] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    // Listen directly to auth changes and fetch within the observer
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUsers([])
        setLoadingUser(false)
        return
      }

      try {
        setLoadingUser(true)
        const token = await currentUser.getIdToken()
        const response = await fetch(`${API_URL}/api/users`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })

        const contentType = response.headers.get('content-type')
        let data = {}

        if (contentType && contentType.includes('application/json')) {
          data = await response.json()
        } else {
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
    })

    return () => unsubscribe()
  }, [])

  // ==========================================
  // BAN / UNBAN
  // ==========================================
  const handleToggleBan = async (targetUser) => {
    const action = targetUser.status === 'banned' ? 'unban' : 'ban'

    if (!window.confirm(`Are you sure you want to ${action} ${targetUser.name || targetUser.email}?`)) {
      return
    }

    const user = auth.currentUser
    if (!user) return

    setBusyId(targetUser.id)

    try {
      const token = await user.getIdToken()

      const response = await fetch(
        `${API_URL}/api/users/${targetUser.id}/status`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status')
      }

      // Update just this one user in local state
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? data.user : u))
      )
    } catch (error) {
      console.error('Ban error:', error)
      alert(error.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-10 pt-10 ">
      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20 ">
        <h1 className="font-mono text-2xl">Manage user</h1>
      </div>

      <div className="overflow-y-auto pb-10 pt-10">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="text-center border theme-border-2 ">
              <th className="w-2/5 text-center py-2 ">User</th>
              <th className="w-1/5 text-center py-2">Role</th>
              <th className="w-1/5 text-center py-2 ">Status</th>
              <th className="w-1/5 text-center py-2 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingUser ? (
              <tr>
                <td colSpan={4} className="py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((details) => (
                <tr key={details.id}>
                  <td 
                    className="pt-10 pb-2 text-center truncate" 
                    title={details.name || details.email}
                  >
                    {details.name || details.email}
                  </td>

                  <td className="pt-10 pb-2 text-center">
                    {details.role}
                  </td>

                  <td className="pt-10 pb-2 text-center">
                    {details.status}
                  </td>

                  <td className="pt-10 pb-2 text-center">
                    <button
                      disabled={busyId === details.id}
                      onClick={() => handleToggleBan(details)}
                      title={details.status === 'banned' ? 'Unban' : 'Ban'}
                      className="inline-flex p-2 border theme-border rounded-md disabled:opacity-40"
                    >
                      {details.status === 'banned' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Ban size={16} />
                      )}
                    </button>
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