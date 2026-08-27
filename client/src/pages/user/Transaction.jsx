import React, { useEffect, useState } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import { auth } from '../../firebase'

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
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  // TRANSACTIONS
  const [transactions, setTransactions] = useState([])

  // SELECTED TRANSACTION
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  //EDIT FORM
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTransactionDate, setEditTransactionDate] = useState('')


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
  // WAIT FOR FIREBASE AUTH
  // ==========================================

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Firebase user:', user)
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  // ==========================================
  // GET TRANSACTIONS
  // ==========================================

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true)

      const user = auth.currentUser

      console.log('Current Firebase user:', user)

      if (!user) {
        console.log('No Firebase user logged in')
        setTransactions([])
        return
      }

      const token = await user.getIdToken()

      const response = await fetch('http://localhost:5000/api/transactions', {
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

      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Get transactions error:', error)
      alert(error.message || 'Failed to get transactions')
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
  }, [authLoading])

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================

  const handleDeleteTransaction = async () => {
    // Check if selectedTransaction exists and has a valid ID
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

      // Get the Firebase ID token
      const token = await user.getIdToken()

      // Send DELETE request with token in Authorization header
      const response = await fetch(
        `http://localhost:5000/api/transactions/${selectedTransaction.id}`,
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

      // Remove item from state without page reload
      setTransactions((prevTransactions) =>
        prevTransactions.filter((item) => item.id !== selectedTransaction.id)
      )

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

      const response = await fetch('http://localhost:5000/api/transactions', {
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

      setTransactions((previousTransactions) => [
        data.transaction,
        ...previousTransactions,
      ])

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

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  }

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (authLoading) {
    return (
      <div className="w-full md:pt-0">
        <p className="theme-text font-mono px-4 sm:px-8 md:px-12 lg:px-20">
          Checking login...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full md:pt-0">
      {/* HEADER */}
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 ">
        <h1 className="font-mono text-xl sm:text-2xl theme-text">
          Transaction
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
        {loadingTransactions && (
          <p className="theme-text font-mono">Loading transactions...</p>
        )}

        {!loadingTransactions && transactions.length === 0 && (
          <p className="theme-text font-mono">No transactions yet.</p>
        )}

        {!loadingTransactions && transactions.length > 0 && (
          <div className="flex flex-col grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 pt-10">
            {transactions.map((transaction) => {
              const currentId = transaction.id || transaction._id
              return (
                <div key={currentId} className="theme-card theme-text theme-border border-2 rounded-md p-4">
                  {/* CARD */}
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h2 >
                         <span className="font-bold text-md">Type: </span>{transaction.category}
                      </h2>
                      <h2 >
                        <span className="font-bold text-md shrink-0"> Amount: </span> ₱{Number(transaction.amount).toFixed(2)}
                      </h2>

                      <h2 >
                        <span className="font-bold text-md">Description: </span>{transaction.description}
                      </h2>
                      <h2 >
                        <span className="font-bold text-md">Date: </span> {formatDate(transaction.transaction_date)}
                      </h2>
                    </div>
                   
                  </div>

                  {/* EDIT / DELETE */}
                  <div className="flex justify-end flex-row ">
                    <button
                      type="button"
                      onClick={() =>
                        setShowEdit(true)
                      }
                      className="p-2 rounded-md theme-text theme-hover"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setShowDelete(true)
                      }}
                      className="p-2  rounded-md theme-text theme-hover"
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


      {showEdit &&(
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowEdit(true)
              }
            }}  
            />
              <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">
                <div className="relative flex items-center justify-center mb-6">
                  <h2 className="font-mono text-md text-center">
                    Edit Transaction
                  </h2>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setShowEdit(false)
                    }}
                    className="absolute right-0 top-0 theme-text theme-hover rounded-md p-1 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className='flex flex-row justify-center gap-4'>
                  <button 
                   className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                  onClick={() => {
                    setShowEdit(false)
                  }}>
                    Cancel
                  </button>

                  <button  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50" >
                    Edit 
                  </button>
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

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">
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
                className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={loading}
                className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
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

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">
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
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  disabled={loading}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddTransaction}
                  disabled={loading}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
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