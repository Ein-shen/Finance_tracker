import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { auth } from '../../firebase'

export const Transaction = () => {

  const [show, setShow] = useState(false)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [transactionDate, setTransactionDate] = useState('')

  const [loading, setLoading] = useState(false)


  // ===============================
  // ADD TRANSACTION
  // ===============================

  const handleAddTransaction = async () => {

    // Check fields
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


      // ---------------------------
      // Get logged-in Firebase user
      // ---------------------------

      const user = auth.currentUser

      if (!user) {
        alert('You must be logged in first')
        return
      }


      // ---------------------------
      // Get Firebase ID token
      // ---------------------------

      const token = await user.getIdToken()


      // ---------------------------
      // Send transaction to server
      // ---------------------------

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


      // ---------------------------
      // Check server response
      // ---------------------------

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add transaction'
        )
      }


      // ---------------------------
      // Success
      // ---------------------------

      console.log(
        'Transaction added:',
        data.transaction
      )


      alert('Transaction added successfully!')


      // ---------------------------
      // Clear form
      // ---------------------------

      setDescription('')
      setAmount('')
      setCategory('')
      setTransactionDate('')


      // ---------------------------
      // Close popup
      // ---------------------------

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


  return (
    <>

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="
        w-full
        flex
        flex-row
        justify-between
        items-center
        px-4
        sm:px-8
        md:px-12
        lg:px-20
        gap-4
      ">

        <h1 className="
          font-mono
          text-lg
          sm:text-2xl
          theme-text
        ">
          Transaction
        </h1>


        <button
          type="button"
          onClick={() => setShow(true)}
          className="
            flex
            items-center
            justify-center
            gap-1
            sm:gap-2
            font-mono
            text-sm
            sm:text-md
            border-2
            rounded-md
            px-3
            py-2
            shrink-0
            theme-border
            theme-text
            theme-hover
          "
        >

          <Plus className="w-4 h-4" />

          Add

        </button>

      </div>


      {/* ========================= */}
      {/* POPUP */}
      {/* ========================= */}

      {show && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          px-4
        ">


          {/* Overlay */}

          <div
            className="
              absolute
              inset-0
              bg-black/50
            "
            onClick={() => setShow(false)}
          />


          {/* Popup */}

          <div className="
            relative
            z-10
            w-full
            max-w-sm
            sm:max-w-md
            max-h-[90vh]
            overflow-y-auto
            rounded-xl
            border-2
            p-4
            sm:p-6
            theme-card
            theme-text
            theme-border
          ">


            {/* ========================= */}
            {/* POPUP HEADER */}
            {/* ========================= */}

            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <h2 className="
                font-mono
                text-xl
              ">
                Add Transaction
              </h2>


              <button
                type="button"
                onClick={() => setShow(false)}
                className="
                  theme-text
                  theme-hover
                  rounded-md
                  p-1
                "
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* ========================= */}
            {/* FORM */}
            {/* ========================= */}

            <div className="
              flex
              flex-col
              gap-4
            ">


              {/* Description */}

              <div className="
                flex
                flex-col
                gap-2
              ">

                <label className="font-mono text-sm">
                  Description
                </label>


                <input
                  type="text"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="e.g. Grocery"
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3
                    py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
                />

              </div>


              {/* Amount */}

              <div className="
                flex
                flex-col
                gap-2
              ">

                <label className="font-mono text-sm">
                  Amount
                </label>


                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="₱0.00"
                  min="0"
                  step="0.01"
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3
                    py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
                />

              </div>


              {/* Category */}

              <div className="
                flex
                flex-col
                gap-2
              ">

                <label className="font-mono text-sm">
                  Category
                </label>


                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3
                    py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
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

              <div className="
                flex
                flex-col
                gap-2
              ">

                <label className="font-mono text-sm">
                  Date
                </label>


                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) =>
                    setTransactionDate(e.target.value)
                  }
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3
                    py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
                />

              </div>


              {/* ========================= */}
              {/* BUTTONS */}
              {/* ========================= */}

              <div className="
                flex
                flex-col
                sm:flex-row
                gap-3
                mt-2
              ">


                {/* Cancel */}

                <button
                  type="button"
                  onClick={() => setShow(false)}
                  disabled={loading}
                  className="
                    w-full
                    border-2
                    rounded-md
                    py-2
                    font-mono
                    theme-text
                    theme-border
                    theme-hover
                  "
                >
                  Cancel
                </button>


                {/* Add */}

                <button
                  type="button"
                  onClick={handleAddTransaction}
                  disabled={loading}
                  className="
                    w-full
                    border-2
                    rounded-md
                    py-2
                    font-mono
                    theme-text
                    theme-border
                    theme-hover
                    disabled:opacity-50
                  "
                >

                  {loading
                    ? 'Adding...'
                    : 'Add Transaction'
                  }

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  )
}