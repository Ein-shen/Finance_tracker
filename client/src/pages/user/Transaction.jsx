import React, { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { auth } from '../../firebase'
import { Pencil, Trash2 } from "lucide-react"

export const Transaction = () => {
  const [show, setShow] = useState(false)

  // Form
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [transactionDate, setTransactionDate] = useState('')

  // Loading
  const [loading, setLoading] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(true)

  // Transactions
  const [transactions, setTransactions] = useState([])


  // ==============================
  // GET TRANSACTIONS
  // ==============================

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true)

        const response = await fetch(
          'http://localhost:5000/api/transactions'
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to get transactions'
          )
        }

        setTransactions(data.transactions || [])

      } catch (error) {
        console.error('Get transactions error:', error)

      } finally {
        setLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [])


  // ==============================
  // ADD TRANSACTION
  // ==============================

  const handleAddTransaction = async () => {
    if (
      !description ||
      !amount ||
      !category ||
      !transactionDate
    ) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      // Get Firebase user
      const user = auth.currentUser

      if (!user) {
        alert('You must be logged in first')
        return
      }

      // Get Firebase token
      const token = await user.getIdToken()

      // Send transaction to server
      const response = await fetch(
        'http://localhost:5000/api/transactions',
        {
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
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add transaction'
        )
      }

      console.log(
        'Transaction added:',
        data.transaction
      )


      // ==============================
      // ADD NEW TRANSACTION TO LIST
      // ==============================

      setTransactions((prev) => [
        data.transaction,
        ...prev,
      ])


      // ==============================
      // CLEAR FORM
      // ==============================

      setDescription('')
      setAmount('')
      setCategory('')
      setTransactionDate('')


      // Close popup
      setShow(false)

    } catch (error) {
      console.error(
        'Transaction error:',
        error
      )

      alert(error.message)

    } finally {
      setLoading(false)
    }
  }


  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDate = (date) => {
    if (!date) return ''

    return new Date(date).toLocaleDateString()
  }


  return (
    <div className="w-full">


      {/* ==================================
          TRANSACTION HEADER
      ================================== */}

      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">

        <h1 className="font-mono text-lg sm:text-2xl theme-text">
          Transaction
        </h1>


        {/* Add Button */}

        <button
          type="button"
          onClick={() => setShow(true)}
          className="flex items-center justify-center gap-1 sm:gap-2 font-mono text-sm sm:text-md border-2 rounded-md px-3 py-2 shrink-0 theme-border theme-text theme-hover"
        >
          <Plus className="w-4 h-4" />

          Add
        </button>

      </div>



      {/* ==================================
          TRANSACTION LIST
      ================================== */}

      <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-20">


        {/* Loading */}

        {loadingTransactions && (

          <p className="theme-text font-mono">
            Loading transactions...
          </p>

        )}



        {/* Empty */}

        {!loadingTransactions &&
          transactions.length === 0 && (

            <p className="theme-text font-mono">
              No transactions yet.
            </p>

          )}



        {/* Transactions */}
      
        <div className='flex flex-row items-center'>    
        <div className='w-full'>
        {!loadingTransactions &&
          transactions.length > 0 && (

            <div className="flex flex-col gap-3">
              
              {transactions.map(
                (transaction) => (

                  <div
                    key={transaction.id}
                    className="theme-card theme-text theme-border border-2 rounded-md p-4"
                  >

                    {/* Top */}

                    <div className="flex justify-between items-center gap-4">

                     

                      <span className="font-mono text-base sm:text-lg">
                        {transaction.category}
                      </span>


                      <span className="font-mono text-base sm:text-lg shrink-0">

                        ₱
                        {Number(
                          transaction.amount
                        ).toFixed(2)}

                      </span>

                    </div>


                    {/* Bottom */}
                    
                    <div className="flex justify-between items-center mt-2 text-sm">

                      
                       <h2 className="font-mono ">
                        {transaction.description}
                      </h2>

                      <span className="font-mono">
                        {formatDate(
                          transaction.transaction_date
                        )}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>
        
        <div className=' right-0 p-4'>
              {!loadingTransactions &&
                transactions.length > 0 && (
                  <>
                    <button className="p-2">
                      <Pencil size={18} />
                    </button>

                    <button className="p-2">
                      <Trash2 size={18} />
                    </button>
                  </>
                )} 
      
          </div>
              
          </div>
      </div>




      {/* ==================================
          POPUP
      ================================== */}

      {show && (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">


          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShow(false)}
          />


          {/* Popup */}

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">


            {/* ==================================
                POPUP HEADER
            ================================== */}

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-mono text-xl">
                Add Transaction
              </h2>


              <button
                type="button"
                onClick={() => setShow(false)}
                className="theme-text theme-hover rounded-md p-1"
              >
                <X className="w-5 h-5" />
              </button>

            </div>



            {/* ==================================
                FORM
            ================================== */}
            
            <div className="flex flex-col gap-4">

              
              {/* Description */}

              <div className="flex flex-col gap-2">

                <label className="font-mono text-sm">
                  Description
                </label>


                <input
                  type="text"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Grocery"
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />

              </div>



              {/* Amount */}

              <div className="flex flex-col gap-2">

                <label className="font-mono text-sm">
                  Amount
                </label>


                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  placeholder="₱0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />

              </div>



              {/* Category */}

              <div className="flex flex-col gap-2">

                <label className="font-mono text-sm">
                  Category
                </label>


                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="food">
                    Food
                  </option>

                  <option value="transportation">
                    Transportation
                  </option>

                  <option value="shopping">
                    Shopping
                  </option>

                  <option value="bills">
                    Bills
                  </option>

                  <option value="entertainment">
                    Entertainment
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>



              {/* Date */}

              <div className="flex flex-col gap-2">

                <label className="font-mono text-sm">
                  Date
                </label>


                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) =>
                    setTransactionDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />

              </div>



              {/* ==================================
                  BUTTONS
              ================================== */}

              <div className="flex flex-col sm:flex-row gap-3 mt-2">


                {/* Cancel */}

                <button
                  type="button"
                  onClick={() =>
                    setShow(false)
                  }
                  disabled={loading}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>



                {/* Add Transaction */}

                <button
                  type="button"
                  onClick={
                    handleAddTransaction
                  }
                  disabled={loading}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >

                  {loading
                    ? 'Adding...'
                    : 'Add Transaction'}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}