import React, { useEffect, useState } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import { auth } from '../../firebase'
import { API_URL } from '../../api'

const CACHE_KEY_PREFIX = 'cachedTransactions_'

export const Transaction = () => {
  // POPUPS DELETE, EDIT, ADD
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  // FORM
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [transactionDate, setTransactionDate] = useState('')

  // LOADING
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // TRANSACTIONS - initialize from cache so something shows instantly.
  // We don't know the user yet at first render, so we peek at any cache
  // key present; it gets corrected/cleared once auth resolves.
  const [transactions, setTransactions] = useState(() => {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(CACHE_KEY_PREFIX)
      )
      if (keys.length === 0) return []
      const cached = localStorage.getItem(keys[0])
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  // Only show a full "loading" state if we truly have nothing cached yet
  const [loadingTransactions, setLoadingTransactions] = useState(
    () => transactions.length === 0
  )

  // SELECTED TRANSACTION
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // EDIT FORM
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTransactionDate, setEditTransactionDate] = useState('')

  // Helper to ensure proper path joining with API_URL
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

  // Helper to build a per-user cache key
  const getCacheKey = (uid) => `${CACHE_KEY_PREFIX}${uid}`

  const saveCache = (uid, data) => {
    try {
      if (uid) {
        localStorage.setItem(getCacheKey(uid), JSON.stringify(data))
      }
    } catch (e) {
      console.error('Failed to save transaction cache:', e)
    }
  }

  // ==========================================
  // WAIT FOR FIREBASE AUTH
  // ==========================================

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Firebase user:', user)

      if (user) {
        // Load the cache for THIS specific user (in case device is shared)
        try {
          const cached = localStorage.getItem(getCacheKey(user.uid))
          if (cached) {
            setTransactions(JSON.parse(cached))
            setLoadingTransactions(false)
          }
        } catch (e) {
          console.error('Failed to read transaction cache:', e)
        }
      } else {
        // Logged out - clear in-memory state (cache stays on disk per-uid,
        // harmless since it's keyed by uid and never shown to another user)
        setTransactions([])
      }

      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  // ==========================================
  // GET TRANSACTIONS
  // ==========================================

  const fetchTransactions = async () => {
    try {
      const user = auth.currentUser

      console.log('Current Firebase user:', user)

      if (!user) {
        console.log('No Firebase user logged in')
        setTransactions([])
        setLoadingTransactions(false)
        return
      }

      // Only show the blocking spinner if we don't already have cached data
      setLoadingTransactions((prev) => (transactions.length === 0 ? true : prev))

      const token = await user.getIdToken()

      const response = await fetch(`${baseUrl}/api/transactions`, {
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
        throw new Error(data.message || 'Failed to get transactions')
      }

      const freshTransactions = data.transactions || []
      setTransactions(freshTransactions)
      saveCache(user.uid, freshTransactions)
    } catch (error) {
      console.error('Get transactions error:', error)
      // If we already have cached transactions showing, fail quietly in the
      // background instead of throwing an alert over the user's data.
      if (transactions.length === 0) {
        alert(error.message || 'Failed to get transactions')
      }
    } finally {
      setLoadingTransactions(false)
    }
  }

  // ==========================================
  // LOAD TRANSACTIONS (only after auth resolves)
  // ==========================================

  useEffect(() => {
    if (!authLoading) {
      fetchTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction || !selectedTransaction.id) {
      alert('Selected transaction is missing an ID.')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser
      if (!user) {
        throw new Error('You must be logged in first')
      }

      const token = await user.getIdToken()

      const response = await fetch(
        `${baseUrl}/api/transactions/${selectedTransaction.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const contentType = response.headers.get('content-type')
      let data = {}

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('Server returned non-JSON:', text)
        throw new Error(`Server returned status ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete transaction')
      }

      setTransactions((prevTransactions) => {
        const updated = prevTransactions.filter(
          (item) => item.id !== selectedTransaction.id
        )
        saveCache(user.uid, updated)
        return updated
      })

      setShowDelete(false)
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Delete transaction error:', error)
      alert(error.message || 'Failed to delete transaction')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // ADD TRANSACTION
  // ==========================================

  const handleAddTransaction = async () => {
    if (!description || !amount || !category || !transactionDate) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser
      if (!user) {
        throw new Error('You must be logged in first')
      }

      const token = await user.getIdToken()

      const response = await fetch(`${baseUrl}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          description,
          amount: Number(amount),
          category,
          transaction_date: transactionDate,
        }),
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
        throw new Error(data.message || 'Failed to add transaction')
      }

      setTransactions((previousTransactions) => {
        const updated = [data.transaction, ...previousTransactions]
        saveCache(user.uid, updated)
        return updated
      })

      setDescription('')
      setAmount('')
      setCategory('')
      setTransactionDate('')
      setShowAdd(false)
    } catch (error) {
      console.error('Transaction error:', error)
      alert(error.message || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // OPEN EDIT MODAL (pre-fill form)
  // ==========================================

  const openEditModal = (transaction) => {
    setSelectedTransaction(transaction)
    setEditDescription(transaction.description)
    setEditAmount(transaction.amount)
    setEditCategory(transaction.category)
    setEditTransactionDate(
      transaction.transaction_date ? transaction.transaction_date.split('T')[0] : ''
    )
    setShowEdit(true)
  }

  // ==========================================
  // EDIT TRANSACTION
  // ==========================================

  const handleEditTransaction = async () => {
    if (!selectedTransaction || !selectedTransaction.id) {
      alert('No transaction selected.')
      return
    }

    if (!editDescription || !editAmount || !editCategory || !editTransactionDate) {
      alert('Please fill in the fields')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser
      if (!user) {
        throw new Error('You must be logged in first')
      }

      const token = await user.getIdToken()

      const response = await fetch(
        `${baseUrl}/api/transactions/${selectedTransaction.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description: editDescription,
            amount: Number(editAmount),
            category: editCategory,
            transaction_date: editTransactionDate,
          }),
        }
      )

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
        throw new Error(data.message || 'Failed to edit transaction')
      }

      setTransactions((prev) => {
        const updated = prev.map((item) =>
          item.id === selectedTransaction.id ? data.transaction : item
        )
        saveCache(user.uid, updated)
        return updated
      })

      setShowEdit(false)
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Edit transaction error:', error)
      alert(error.message || 'Failed to edit transaction')
    } finally {
      setLoading(false)
    }
  }

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="w-full md:pt-0 h-screen">
      {/* HEADER */}
      <div className="w-full   rounded-md px-5 flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 ">
        <h1 className="font-mono text-xl sm:text-2xl theme-text">
          Transactions
          {authLoading && (
            <span className="ml-2 text-xs opacity-60 align-middle">
              (checking login...)
            </span>
          )}
        </h1>

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-1 sm:gap-2 font-mono text-sm sm:text-md rounded-md px-1.5 py-1 md:py-2 md:px-3 shrink-0 theme-border theme-text theme-hover"
        >
          <Plus size={25} />
        </button>
      </div>

      {/* TRANSACTION LIST */}
      <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-20">
        {loadingTransactions && transactions.length === 0 && (
          <p className="theme-text font-mono">Transaction loading...</p>
        )}

        {!loadingTransactions && transactions.length === 0 && (
          <p className="theme-text font-mono">No transactions yet.</p>
        )}

        {transactions.length > 0 && (
          <div className="theme-div grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 pt-10">
            {transactions.map((transaction) => {
              const currentId = transaction.id || transaction._id
              return (
                <div key={currentId} className="theme-card theme-text rounded-md p-4">
                  {/* CARD */}
                  <div className="flex justify-between items-center">
                    
                          <div className="space-y-5 w-full ">

                            {/* CATEGORY */}
                            <h2 className="w-full flex justify-center items-center">
                              <span className="font-bold text-md">
                                {transaction.category}
                              </span>
                            </h2>

                            {/* TRANSACTION DETAILS */}
                            <div className="flex justify-center ">
                              <div className="text-left">
                                <h2>
                                  <span className="font-bold text-md">Amount: </span>
                                  ₱{Number(transaction.amount).toFixed(2)}
                                </h2>

                                <h2>
                                  <span className="font-bold text-md">Description: </span>
                                  {transaction.description}
                                </h2>

                                <h2>
                                  <span className="font-bold text-md">Date: </span>
                                  {formatDate(transaction.transaction_date)}
                                </h2>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* EDIT / DELETE */}
                        <div className="flex justify-end flex-row pt-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(transaction)}
                            className="p-1.5 rounded-md theme-text theme-hover"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowDelete(true)
                            }}
                            className="p-1.5 rounded-md theme-text theme-hover"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>




                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* EDIT TRANSACTION POPUP */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowEdit(false)
                setSelectedTransaction(null)
              }
            }}
          />

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl  p-4 sm:p-6 theme-card theme-text theme-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xl">Edit Transaction</h2>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowEdit(false)
                  setSelectedTransaction(null)
                }}
                className="theme-text theme-hover rounded-md p-1 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-md px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Amount</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-md px-3 py-2 outline-none theme-bg theme-text theme-border"
                >
                  <option value="">Select category</option>
                  <option value="food">Food</option>
                  <option value="transportation">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Date</label>
                <input
                  type="date"
                  value={editTransactionDate}
                  onChange={(e) => setEditTransactionDate(e.target.value)}
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEdit(false)
                    setSelectedTransaction(null)
                  }}
                  disabled={loading}
                  className="w-full border border-white/10  rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleEditTransaction}
                  disabled={loading}
                  className="w-full bg-blue-500 border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowDelete(false)
                setSelectedTransaction(null)
              }
            }}
          />

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6 theme-card theme-text theme-border">
            <div className="relative flex items-center justify-between mb-6">
              <h2 className="font-mono text-md">
                Are you sure to delete this transaction?
              </h2>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowDelete(false)
                  setSelectedTransaction(null)
                }}
                className="absolute right-0 top-0 theme-text theme-hover rounded-md p-1 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDelete(false)
                  setSelectedTransaction(null)
                }}
                disabled={loading}
                className="w-full border border-white/10  rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={loading}
                className="w-full bg-red-600  border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TRANSACTION POPUP */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) setShowAdd(false)
            }}
          />

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl  p-4 sm:p-6 theme-card theme-text theme-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xl">Add Transaction</h2>

              <button
                type="button"
                disabled={loading}
                onClick={() => setShowAdd(false)}
                className="theme-text theme-hover rounded-md p-1 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Grocery"
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₱0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md px-3 py-2 outline-none theme-bg theme-text theme-border"
                >
                  <option value="">Select category</option>
                  <option value="food">Food</option>
                  <option value="transportation">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Date</label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full rounded-md px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  disabled={loading}
                  className="w-full  border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddTransaction}
                  disabled={loading}
                  className="bg-green-500 border border-white/10 w-full rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}