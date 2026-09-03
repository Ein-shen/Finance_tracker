import React, { useState, useEffect } from 'react'
import { auth } from '../../firebase'

export const AdminUser = () => {
  // LOADING
  const [loadingUser, setLoadingUser] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  // USERS
  const [users, setUsers] = useState([])

  // ==========================================
  // WAIT FOR FIREBASE AUTH
  // ==========================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Firebase user:', user)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // ==========================================
  // FETCH USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoadingUser(true)

      const user = auth.currentUser
      console.log('Current Firebase user:', user)

      if (!user) {
        console.log('No firebase user logged in')
        setUsers([])
        return
      }

      const token = await user.getIdToken()

      const response = await fetch('http://localhost:5000/api/users', {
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

  // ==========================================
  // LOAD USERS (only after auth resolves)
  // ==========================================
  useEffect(() => {
    if (!authLoading) {
      fetchUsers()
    }
  }, [authLoading])

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
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Last active</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingUser ? (
              <tr>
                <td colSpan={5} className="py-4">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4">No users found</td>
              </tr>
            ) : (
              users.map((details) => (
                <tr key={details.id} className="">
                  <td className="py-2 px-4">{details.name ||details.email}</td>
                  <td className="py-2 pr-4">{details.role}</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}