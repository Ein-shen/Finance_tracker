import React, { useEffect, useState } from 'react'
import { Plus, X, Trash2, Pencil } from 'lucide-react'
import { auth } from '../../firebase'

export const Schedule = () => {
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [deleteId, setDeleteId] = useState(null)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [repeatType, setRepeatType] = useState('')

  const [schedules, setSchedules] = useState([])


  const [loading, setLoading] = useState(false)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  

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
  // GET SCHEDULES
  // ==========================================

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true)

      const user = auth.currentUser

      console.log('Current Firebase user:', user)

      if (!user) {
        console.log('No Firebase user logged in')
        setSchedules([])
        return
      }

      const token = await user.getIdToken()

      console.log('Firebase token exists:', !!token)

      const response = await fetch(
        'http://localhost:5000/api/schedule',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to get schedules'
        )
      }

      setSchedules(data.schedules)

    } catch (error) {
      console.error('Get schedules error:', error)
    } finally {
      setLoadingSchedules(false)
    }
  }

  // ==========================================
  // LOAD SCHEDULES
  // ==========================================

  useEffect(() => {
    if (!authLoading) {
      fetchSchedules()
    }
  }, [authLoading])

  // ==========================================
  // ADD SCHEDULE
  // ==========================================

  const handleAddSchedule = async () => {
    if (
      !description ||
      !amount ||
      !category ||
      !dueDate ||
      !repeatType
    ) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser

      console.log('User before submit:', user)

      if (!user) {
        alert('You must be logged in first')
        return
      }

      const token = await user.getIdToken()

      console.log('Token exists:', !!token)

      if (!token) {
        alert('Could not get Firebase token')
        return
      }

      const response = await fetch(
        'http://localhost:5000/api/schedule',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            description: description,
            amount: Number(amount),
            category: category,
            due_date: dueDate,
            repeat_type: repeatType,
          }),
        }
      )

      const data = await response.json()

      console.log('Server response:', data)

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to add schedule'
        )
      }

      alert('Schedule added successfully!')

      setDescription('')
      setAmount('')
      setCategory('')
      setDueDate('')
      setRepeatType('Monthly')

      setShowAdd(false)

      fetchSchedules()

    } catch (error) {
      console.error('Schedule error:', error)
      alert(error.message)

    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // DELETE SCHEDULE
  // ==========================================

  const handleDeleteSchedule = async (id) => {
    try {
      const user = auth.currentUser

      if (!user) {
        alert('You must be logged in first')
        return
      }

      const token = await user.getIdToken()

      const response = await fetch(
        `http://localhost:5000/api/schedule/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete schedule'
        )
      }

      setSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== id)
      )

    } catch (error) {
      console.error('Delete schedule error:', error)
      alert(error.message)
    }
  }

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (authLoading) {
    return (
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20">
        <p className="theme-text">
          Checking login...
        </p>
      </div>
    )
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="w-full">

      {/* HEADER */}

      <div className="w-full flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">

        <h1 className="font-mono text-lg sm:text-2xl theme-text">
          Schedule
        </h1>

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 font-mono text-sm sm:text-md rounded-md px-3 py-2 theme-border theme-text theme-hover"
        >
          <Plus className="w-5 h-5" />
        </button>

      </div>


      {/* SCHEDULE LIST */}

      <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-20">

        {loadingSchedules ? (
          <p className="theme-text">
            Loading schedules...
          </p>
        ) : schedules.length === 0 ? (
          <p className="theme-text">
            No schedules yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 pt-10">

            {schedules.map((schedule) => (

              <div
                key={schedule.id}
                className="theme-card theme-text theme-border border-2 rounded-md p-4"
              >

                <div className="flex justify-between items-center">

                  <div className='space-y-1'>

                    <h2>
                      <span className='font-bold text-md'>Description: </span>
                      {schedule.description}
                    </h2>

                    <h2>
                      <span className='font-bold text-md'>Category: </span>
                      {schedule.category}
                    </h2>

                    <h2>
                      <span className='font-bold text-md'>Amount: </span>
                      ₱{Number(schedule.amount).toFixed(2)}
                    </h2>

                    <h2>
                      <span className='font-bold text-md'>Due: </span>
                      {new Date(schedule.due_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </h2>

                    <span className='font-bold text-md'>
                      {schedule.repeat_type}
                    </span>

                  </div>

                </div>
                

                {/* Buttons */}
                <div className="flex justify-end flex-row">

                  {/* Edit button */}
                  <button
                  onClick={() => {
                    setShowEdit(true)
                  }}
                    type="button"
                    className="p-2 rounded-md  flex items-center  text-sm theme-text theme-hover"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteId(schedule.id)
                     setShowDelete(true)
                    }}
                    className=" p-2 rounded-md flex items-center  text-sm theme-text theme-hover"
                  >
                    <Trash2 className=" w-4 h-4" />
                  </button>

                  
                </div>

                

              </div>

            ))}

          </div>
        )}

      </div>


    {/* EDIT POPUP button */}

    {showEdit && (
      <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
         <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowEdit(false)
              }
            }}
          />
      </div>
    )}



      {/* DELETE POPUP */}

      {showDelete && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
         <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowDelete(false)
              }
            }}
          />

          <div className='relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='font-mono text-md text-center'>
                Are you sure to delete this schedule?
              </h1>

              <button
                type="button"
                disabled={loading}
                onClick={() => setShowDelete(false)}
                className="theme-text theme-hover rounded-md p-1 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">

              {/* Cancel confirm button */}
              <button
                type="button"
                onClick={() =>
                  setShowDelete(false)}
                disabled={loading}
                className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Delete confirm*/}
              <button
                className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                onClick={() => {
                  handleDeleteSchedule(deleteId)
                  setShowDelete(false)
                }}
                disabled={loading}
                
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ADD SCHEDULE POPUP */}

      {showAdd && (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowAdd(false)
              }
            }}
          />

          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">

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
                  placeholder="e.g. Internet"
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
                <label className="font-mono text-sm">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Repeat</label>
                <select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value)}
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                >
                  <option value="Once">Once</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowAdd(false)}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>

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