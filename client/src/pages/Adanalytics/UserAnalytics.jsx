import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { auth } from '../../firebase'
import { API_URL } from '../../api'

export const UserAnalytics = () => {

  const [loadingUsers, setLoadingUsers] = useState(true)
  const [users, setUsers] = useState(null)

  const [authLoading, setAuthLoading] = useState(true)

  const fetchUsersData = async () => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('You must be logged in first')
    }
    const token = await user.getIdToken()

    const response = await fetch(`${API_URL}/api/admin/users/analytics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const contentType = response.headers.get('content-type')
    let data = {}

    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error('Server returned non-JSON:', text)
      throw new Error(`Server returned ${response.status} instead of JSON`)
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get analytics')
    }
    return data
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  const getUsers = async () => {
    try {
      setLoadingUsers(true)
      const user = auth.currentUser

      if (!user) {
        setUsers(null)
        return
      }

      const data = await fetchUsersData()
      setUsers(data)
    } catch (error) {
      console.error('Get analytics error:', error)
      alert(error.message || 'Failed to get analytics')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      getUsers()
    }
  }, [authLoading])

  if (authLoading) {
    return (
      <div className="w-full md:pt-0">
        <p className="theme-text font-mono px-4 sm:px-8 md:px-12 lg:px-20">
          Checking login...
        </p>
      </div>
    )
  }

  // ======================================
  // USERS (ALL)
  // ======================================
  return (
    <div>
      <h2 className="font-mono text-xl theme-text mb-4">
        All Users
      </h2>

      {loadingUsers && (
        <p className="theme-text font-mono">Loading Users...</p>
      )}

      {!loadingUsers && !users && (
        <p className="theme-text font-mono">No user data yet.</p>
      )}

      {!loadingUsers && users && (
        <div className="flex flex-col gap-10 pt-10">

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="theme-card theme-border border-2 rounded-md p-4 flex-1">
              <p className="theme-text font-mono text-sm opacity-70 text-center">Total Users</p>
              <p className="theme-text font-mono text-2xl font-bold text-center">
                {users?.totalUsers ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {!users?.byRole || users.byRole.length === 0 ? (
              <div className="theme-text font-mono">No role data yet.</div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={users.byRole}>
                    <XAxis dataKey="role" interval={0} />
                    <YAxis domain={[0, 'dataMax']} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#72f7cd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}