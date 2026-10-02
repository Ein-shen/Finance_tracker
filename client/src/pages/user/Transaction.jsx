import React, { useEffect, useMemo, useState } from 'react'
import { Plus, X, Pencil, Trash2, Utensils, Car, ShoppingBag, Receipt, Film, Wallet } from 'lucide-react'
import { auth } from '../../firebase'
import { API_URL } from '../../api'
import { HashLoader } from 'react-spinners'

const CACHE_KEY_PREFIX = 'cachedTransactions_'

export const Transaction = () => {
  // ---------- POPUPS ----------
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  // ---------- ADD FORM ----------
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [transactionDate, setTransactionDate] = useState('')

  // ---------- LOADING ----------
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // ---------- TRANSACTIONS ----------
  const [transactions, setTransactions] = useState(() => {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(CACHE_KEY_PREFIX))
      if (keys.length === 0) return []
      const cached = localStorage.getItem(keys[0])
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [loadingTransactions, setLoadingTransactions] = useState(() => transactions.length === 0)

  // ---------- FILTER / SELECTED ----------
  const [filterMonth, setFilterMonth] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // ---------- EDIT FORM ----------
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTransactionDate, setEditTransactionDate] = useState('')

  // ---------- API HELPERS ----------
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL
  const getCacheKey = (uid) => `${CACHE_KEY_PREFIX}${uid}`

  const saveCache = (uid, data) => {
    try {
      if (uid) localStorage.setItem(getCacheKey(uid), JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save transaction cache:', error)
    }
  }

  // ---------- CATEGORY ICON ----------
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'food': return <Utensils size={19} />
      case 'transportation': return <Car size={19} />
      case 'shopping': return <ShoppingBag size={19} />
      case 'bills': return <Receipt size={19} />
      case 'entertainment': return <Film size={19} />
      default: return <Wallet size={19} />
    }
  }

  // ---------- WAIT FOR FIREBASE AUTH ----------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Firebase user:', user)

      if (user) {
        try {
          const cached = localStorage.getItem(getCacheKey(user.uid))
          if (cached) {
            setTransactions(JSON.parse(cached))
            setLoadingTransactions(false)
          }
        } catch (error) {
          console.error('Failed to read transaction cache:', error)
        }
      } else {
        setTransactions([])
      }

      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  // ---------- GET TRANSACTIONS ----------
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

      setLoadingTransactions((prev) => (transactions.length === 0 ? true : prev))

      const token = await user.getIdToken()
      const response = await fetch(`${baseUrl}/api/transactions`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
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

      if (!response.ok) throw new Error(data.message || 'Failed to get transactions')

      const freshTransactions = data.transactions || []
      setTransactions(freshTransactions)
      saveCache(user.uid, freshTransactions)
    } catch (error) {
      console.error('Get transactions error:', error)
      if (transactions.length === 0) alert(error.message || 'Failed to get transactions')
    } finally {
      setLoadingTransactions(false)
    }
  }

  // ---------- LOAD TRANSACTIONS ----------
  useEffect(() => {
    if (!authLoading) fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

  // ---------- DELETE TRANSACTION ----------
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction || !selectedTransaction.id) {
      alert('Selected transaction is missing an ID.')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser
      if (!user) throw new Error('You must be logged in first')

      const token = await user.getIdToken()
      const response = await fetch(`${baseUrl}/api/transactions/${selectedTransaction.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })

      const contentType = response.headers.get('content-type')
      let data = {}

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('Server returned non-JSON:', text)
        throw new Error(`Server returned status ${response.status}`)
      }

      if (!response.ok) throw new Error(data.message || 'Failed to delete transaction')

      setTransactions((previousTransactions) => {
        const updated = previousTransactions.filter((item) => item.id !== selectedTransaction.id)
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

  // ---------- ADD TRANSACTION ----------
  const handleAddTransaction = async () => {
    if (!description || !amount || !category || !transactionDate) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser
      if (!user) throw new Error('You must be logged in first')

      const token = await user.getIdToken()
      const response = await fetch(`${baseUrl}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (!response.ok) throw new Error(data.message || 'Failed to add transaction')

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

  // ---------- OPEN EDIT MODAL ----------
  const openEditModal = (transaction) => {
    setSelectedTransaction(transaction)
    setEditDescription(transaction.description)
    setEditAmount(transaction.amount)
    setEditCategory(transaction.category)
    setEditTransactionDate(transaction.transaction_date ? transaction.transaction_date.split('T')[0] : '')
    setShowEdit(true)
  }

  // ---------- EDIT TRANSACTION ----------
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
      if (!user) throw new Error('You must be logged in first')

      const token = await user.getIdToken()
      const response = await fetch(`${baseUrl}/api/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          description: editDescription,
          amount: Number(editAmount),
          category: editCategory,
          transaction_date: editTransactionDate,
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

      if (!response.ok) throw new Error(data.message || 'Failed to edit transaction')

      setTransactions((previous) => {
        const updated = previous.map((item) => (item.id === selectedTransaction.id ? data.transaction : item))
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

  // ---------- FORMAT DATE ----------
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ---------- MONTH FILTER ----------
  const getYearMonth = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const filteredTransactions = useMemo(() => {
    if (!filterMonth) return transactions
    return transactions.filter((t) => getYearMonth(t.transaction_date) === filterMonth)
  }, [transactions, filterMonth])

  const getMonthLabel = (ym) => {
    if (!ym) return ''
    const [year, month] = ym.split('-')
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
  }

  const filterMonthLabel = useMemo(() => getMonthLabel(filterMonth), [filterMonth])

  const availableMonths = useMemo(() => {
    const months = new Set()
    transactions.forEach((t) => {
      const ym = getYearMonth(t.transaction_date)
      if (ym) months.add(ym)
    })
    return Array.from(months).sort().reverse()
  }, [transactions])

  // ---------- UI ----------
  return (
    <div className="w-full md:pt-0">
      {/* HEADER */}
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20">
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

      {/* FILTER */}
      <div className="mt-4 px-4 sm:px-8 md:px-12 lg:px-20 flex flex-wrap items-center gap-3">
        <select
          value={filterMonth}
          onChange={(event) => setFilterMonth(event.target.value)}
          className="rounded-md py-1.5 outline-none theme-text theme-border font-mono text-sm"
        >
          <option value="">All Transactions</option>
          {availableMonths.map((ym) => (
            <option  key={ym} value={ym}>{getMonthLabel(ym)}</option>
          ))}
        </select>
      </div>

      {/* TRANSACTION LIST */}
      <div className="mt-8 px-4 pb-10 sm:px-8 md:px-12 lg:px-20">
        {/* LOADING */}
        {loadingTransactions && transactions.length === 0 && (
          <div className="flex justify-center py-10">
            <HashLoader size={25} color="#dddfe9" />
          </div>
        )}

        {/* EMPTY */}
        {!loadingTransactions && transactions.length === 0 && (
          <div className="rounded-2xl border p-8 text-center theme-border">
            <Wallet size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm opacity-60">No transactions yet.</p>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="mt-4 rounded-xl border px-4 py-2 text-sm theme-border theme-hover"
            >
              Add your first transaction
            </button>
          </div>
        )}

        {/* NO FILTER RESULTS */}
        {!loadingTransactions && transactions.length > 0 && filteredTransactions.length === 0 && (
          <div className="rounded-2xl border p-8 text-center theme-border">
            <p className="text-sm opacity-60">No transactions for {filterMonthLabel || 'this period'}.</p>
          </div>
        )}

        {/* TRANSACTIONS */}
        {filteredTransactions.length > 0 && (
          <div className="space-y-5 pt-10">
            {filteredTransactions.map((transaction) => {
              const currentId = transaction.id || transaction._id

              return (
                <div
                  key={currentId}
                  className="theme-card border-b theme-border theme-text w-full rounded-2xl border-white/10 border-1 hover:border-white/25 p-5 transition-all duration-200 hover:-translate-y-[1px]"
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-black/5 dark:bg-white/10">
                        {getCategoryIcon(transaction.category)}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold capitalize">{transaction.category}</h2>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <div>
                        <p className="text-xs opacity-40">Transaction date</p>
                        <p className="mt-1 text-sm text-green-500 font-medium">{formatDate(transaction.transaction_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="my-5 h-px border-b theme-border w-full bg-black/10 dark:bg-white/10" />

                  {/* BOTTOM */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm capitalize opacity-50">{transaction.description}</p>
                      <p className="font-medium text-red-500">-₱{Number(transaction.amount).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(transaction)}
                        className="rounded-lg p-2 theme-hover opacity-50 transition hover:bg-black/5 hover:opacity-100 hover:text-green-500 dark:hover:bg-white/10"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setShowDelete(true)
                        }}
                        className="rounded-lg p-2 theme-hover opacity-50 transition hover:bg-black/5 hover:opacity-100 hover:text-red-500 dark:hover:bg-white/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* EDIT POPUP */}
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

          <div className="relative z-10 w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border p-5 theme-card theme-text theme-border sm:max-w-md sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Transaction</h2>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowEdit(false)
                  setSelectedTransaction(null)
                }}
                className="rounded-lg p-1 opacity-60 transition hover:opacity-100 disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm">Amount</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(event) => setEditAmount(event.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm">Category</label>
                <select value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border">
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
                <label className="text-sm">Date</label>
                <input
                  type="date"
                  value={editTransactionDate}
                  onChange={(event) => setEditTransactionDate(event.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowEdit(false)
                    setSelectedTransaction(null)
                  }}
                  disabled={loading}
                  className="w-full rounded-xl border py-2.5 text-sm theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>

                <button type="button" onClick={handleEditTransaction} disabled={loading} className="w-full rounded-xl border py-2.5 text-sm theme-border theme-hover disabled:opacity-50">
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

          <div className="relative z-10 w-full max-w-sm rounded-2xl border p-5 theme-card theme-text theme-border">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="pr-5 text-base font-medium">Are you sure you want to delete this transaction?</h2>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowDelete(false)
                  setSelectedTransaction(null)
                }}
                className="rounded-lg p-1 opacity-60 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowDelete(false)
                  setSelectedTransaction(null)
                }}
                disabled={loading}
                className="w-full rounded-xl border py-2.5 text-sm theme-border theme-hover disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={loading}
                className="w-full rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD POPUP */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) setShowAdd(false)
            }}
          />

          <div className="relative z-10 w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border p-5 theme-card theme-text theme-border sm:max-w-md sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add Transaction</h2>
              <button type="button" disabled={loading} onClick={() => setShowAdd(false)} className="rounded-lg p-1 opacity-60 transition hover:opacity-100 disabled:opacity-30">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="e.g. Grocery"
                  className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="₱0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm">Category</label>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border">
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
                <label className="text-sm">Date</label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setShowAdd(false)} disabled={loading} className="w-full rounded-xl border py-2.5 text-sm theme-border theme-hover disabled:opacity-50">
                  Cancel
                </button>

                <button type="button" onClick={handleAddTransaction} disabled={loading} className="w-full rounded-xl border py-2.5 text-sm theme-border theme-hover disabled:opacity-50">
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