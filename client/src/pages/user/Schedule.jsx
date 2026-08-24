import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

export const Schedule = () => {
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [repeatType, setRepeatType] = useState('once')

  const handleAddSchedule = async () => {
    if (!description || !amount || !category || !dueDate) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/schedule',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            amount: Number(amount),
            category,
            due_date: dueDate,
            repeat_type: repeatType,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add schedule'
        )
      }

      console.log('Schedule added:', data)

      alert('Schedule added successfully!')

      setDescription('')
      setAmount('')
      setCategory('')
      setDueDate('')
      setRepeatType('once')

      setShowAdd(false)

    } catch (error) {
      console.error('Schedule error:', error)
      alert(error.message)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">

      {/* Header */}
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">

        <h1 className="font-mono text-lg sm:text-2xl theme-text">
          Schedule
        </h1>

        {/* Add Button */}
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-1 sm:gap-2 font-mono text-sm sm:text-md px-3 py-2 shrink-0 theme-text theme-hover"
        >
          <Plus size={25} />
         
        </button>

      </div>


      {/* Popup */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowAdd(false)
              }
            }}
          />

          {/* Popup Box */}
          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

              <h2 className="font-mono text-xl">
                Add Schedule
              </h2>

              <button
                type="button"
                disabled={loading}
                onClick={() => setShowAdd(false)}
                className="theme-text theme-hover rounded-md p-1 disabled:opacity-50"
              >
                <X size={20} />
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
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="e.g. Netflix"
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
                    setAmount(e.target.value)
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
                    setCategory(e.target.value)
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


              {/* Due Date */}
              <div className="flex flex-col gap-2">

                <label className="font-mono text-sm">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />

              </div>


              {/* Repeat */}
              <div className="flex flex-col gap-2">

                <label className="font-mono text-sm">
                  Repeat
                </label>

                <select
                  value={repeatType}
                  onChange={(e) =>
                    setRepeatType(e.target.value)
                  }
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                >
                  <option value="once">
                    Once
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="yearly">
                    Yearly
                  </option>
                </select>

              </div>


              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">

                {/* Cancel */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowAdd(false)}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>


                {/* Add */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAddSchedule}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Schedule'}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}