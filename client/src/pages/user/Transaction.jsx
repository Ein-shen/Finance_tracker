import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

export const Transaction = () => {
  const [show, setShow] = useState(false)

  return (
    <>
      {/* Transaction Header */}
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4 ">

        <h1 className="font-mono text-lg sm:text-2xl theme-text">
          Transaction
        </h1>

        <button
          onClick={() => setShow(true)}
          className="
            flex items-center justify-center
            gap-1 sm:gap-2
            font-mono text-sm sm:text-md
            border-2 rounded-md
            px-3 py-2
            shrink-0
            theme-hover
          "
        >
          <Plus className="w-4 h-4" />
          Add
        </button>

      </div>

      {/* Popup */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          {/* Popup Box */}
          <div className="
            w-full
            max-w-sm
            md:max-md
            rounded-xl
            border-2
            p-4 sm:p-6
            theme-card
            theme-text
            theme-border
          ">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

              <h2 className="font-mono text-xl">
                Add Transaction
              </h2>

              <button
                onClick={() => setShow(false)}
                className="theme-text"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">
                  Description
                </label>

                <input
                  type="text"
                  placeholder="e.g. Grocery"
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3 py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">
                  Amount
                </label>

                <input
                  type="number"
                  placeholder="₱0.00"
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3 py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">
                  Category
                </label>

                <select
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3 py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
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

              {/* Date */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">
                  Date
                </label>

                <input
                  type="date"
                  className="
                    w-full
                    rounded-md
                    border-2
                    px-3 py-2
                    outline-none
                    theme-bg
                    theme-text
                    theme-border
                  "
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">

                <button
                  onClick={() => setShow(false)}
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

                <button
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
                  Add Transaction
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}