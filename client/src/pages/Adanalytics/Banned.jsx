import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { auth } from '../../firebase'


export const Banned = () => {

  const [loadingBanned, setLoadingBanned] = useState(true)
  const [banned, setBanned] = useState(null)

  const [authLoading, setAuthLoading] = useState(true)

  const fetchBannedAcc = async () => {
    const user = auth.currentUser
    if (!user) {
      throw new Error('You must be logged in first')
    }
    const token = await user.getIdToken()

    const response = await fetch('http://localhost:5000/api/admin/users/banned/count', {
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

  // ------------------------------------------
  // Firebase Auth Listener & Fetch Trigger
  // ------------------------------------------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const getBanned = async () => {
    try {
      setLoadingBanned(true)
      const user = auth.currentUser

      if (!user) {
        setBanned(null)
        return
      }

      const data = await fetchBannedAcc()
      setBanned(data)
    } catch (error) {
      console.error('Get analytics error:', error)
      alert(error.message || 'Failed to get analytics')
    } finally {
      setLoadingBanned(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      getBanned()
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
  // BANNED USERS
  // ======================================
  return (
    <div>
      <h2 className="font-mono text-xl theme-text mb-4">
        Banned Users
      </h2>

      {loadingBanned && (
        <p className="theme-text font-mono">Loading banned...</p>
      )}

      {!loadingBanned && !banned && (
        <p className="theme-text font-mono">No banned account data yet.</p>
      )}

      {!loadingBanned && banned && (
        <div className="flex flex-col gap-10 pt-10">

          <div className="flex flex-col sm:flex-row gap-4">

            <div className="theme-card theme-border border-2 rounded-md p-4 flex-1">
              <p className="theme-text font-mono text-sm opacity-70 text-center">Total Active</p>
              <p className="theme-text font-mono text-2xl font-bold text-center">
                {banned?.activeCount ?? 0}
              </p>
            </div>
            
            <div className="theme-card theme-border border-2 rounded-md p-4 flex-1">
              <p className="theme-text font-mono text-sm opacity-70 text-center">Total Banned</p>
              <p className="theme-text font-mono text-2xl font-bold text-center">
                {banned?.bannedCount ?? 0}
              </p>
            </div>
            

          </div>

          <div className="mt-6">
            {!banned?.byStatus || banned.byStatus.length === 0 ? (
              <div className="theme-text font-mono">No status data yet.</div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={banned.byStatus}>
                    <XAxis dataKey="status" interval={0} />
                    <YAxis domain={[0, 'dataMax']} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {banned.byStatus.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={
                            entry.status === 'banned' ? '#d44b4b' :
                            entry.status === 'active' ? '#42c471' :
                            '#72f7cd' // fallback for any other status
                            }
                        />
                        ))}
                    </Bar>
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