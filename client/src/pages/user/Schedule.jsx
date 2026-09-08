import React, { useEffect, useState } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import { auth } from '../../firebase'
import { API_URL } from '../../api.js'

export const Schedule = () => {
  // ==========================================
  // POPUPS
  // ==========================================
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  // ==========================================
  // ADD FORM
  // ==========================================
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [repeatType, setRepeatType] = useState('')

  // ==========================================
  // LOADING
  // ==========================================
  const [loading, setLoading] = useState(false)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  // ==========================================
  // SCHEDULES & SELECTION
  // ==========================================
  const [schedules, setSchedules] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  // ==========================================
  // EDIT FORM
  // ==========================================
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editRepeatType, setEditRepeatType] = useState('')

  // Helper function to extract correct unique identifier
  const getScheduleId = (item) => item?.id || item?._id

  // ==========================================
  // FIREBASE AUTH LISTENER
  // ==========================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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

      if (!user) {
        setSchedules([])
        return
      }

      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/schedule`, {
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
        throw new Error(`Server returned status ${response.status}: ${text}`)
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get schedules')
      }

      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('Get schedules error:', error)
      alert(error.message || 'Failed to get schedules')
    } finally {
      setLoadingSchedules(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchSchedules()
    }
  }, [authLoading])

  // ==========================================
  // DELETE SCHEDULE
  // ==========================================
  const handleDeleteSchedule = async () => {
    const targetId = getScheduleId(selectedSchedule)
    if (!targetId) {
      alert('Selected schedule is missing an ID.')
      return
    }

    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) throw new Error('You must be logged in first')

      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/schedule/${targetId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const contentType = response.headers.get('content-type')
      let data = {}

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        throw new Error(`Server returned status ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete schedule')
      }

      setSchedules((prev) =>
        prev.filter((item) => getScheduleId(item) !== targetId)
      )
      setShowDelete(false)
      setSelectedSchedule(null)
    } catch (error) {
      console.error('Delete schedule error:', error)
      alert(error.message || 'Failed to delete schedule')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // ADD SCHEDULE
  // ==========================================
  const handleAddSchedule = async () => {
    if (!description || !amount || !category || !dueDate || !repeatType) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) throw new Error('You must be logged in first')

      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          category,
          due_date: dueDate,
          repeat_type: repeatType,
        }),
      })

      const contentType = response.headers.get('content-type')
      let data = {}

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        throw new Error(`Server returned status ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add schedule')
      }

      setSchedules((prev) => [data.schedule, ...prev])

      setDescription('')
      setAmount('')
      setCategory('')
      setDueDate('')
      setRepeatType('')
      setShowAdd(false)
    } catch (error) {
      console.error('Add schedule error:', error)
      alert(error.message || 'Failed to add schedule')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // EDIT SCHEDULE
  // ==========================================
  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule)
    setEditDescription(schedule.description || '')
    setEditAmount(schedule.amount || '')
    setEditCategory(schedule.category || '')
    setEditRepeatType(schedule.repeat_type || '')
    setEditDueDate(
      schedule.due_date ? schedule.due_date.split('T')[0] : ''
    )
    setShowEdit(true)
  }

  const handleEditSchedule = async () => {
    const targetId = getScheduleId(selectedSchedule)
    if (!targetId) {
      alert('No schedule selected.')
      return
    }

    if (
      !editDescription ||
      !editAmount ||
      !editCategory ||
      !editDueDate ||
      !editRepeatType
    ) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) throw new Error('You must be logged in first')

      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/schedule/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: editDescription,
          amount: Number(editAmount),
          category: editCategory,
          due_date: editDueDate,
          repeat_type: editRepeatType,
        }),
      })

      const contentType = response.headers.get('content-type')
      let data = {}

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        throw new Error(`Server returned status ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to edit schedule')
      }

      setSchedules((prev) =>
        prev.map((item) =>
          getScheduleId(item) === targetId ? data.schedule : item
        )
      )

      setShowEdit(false)
      setSelectedSchedule(null)
    } catch (error) {
      console.error('Edit schedule error:', error)
      alert(error.message || 'Failed to edit schedule')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    ).toLocaleDateString()
  }

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
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20">
        <h1 className="font-mono text-xl sm:text-2xl theme-text">Schedule</h1>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-1 sm:gap-2 font-mono text-sm sm:text-md rounded-md px-1.5 py-1 md:py-2 md:px-3 shrink-0 theme-border theme-text theme-hover"
        >
          <Plus size={25} />
        </button>
      </div>

      {/* SCHEDULE LIST */}
      <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-20">
        {loadingSchedules && (
          <p className="theme-text font-mono">Loading schedules...</p>
        )}

        {!loadingSchedules && schedules.length === 0 && (
          <p className="theme-text font-mono">No schedules yet.</p>
        )}

        {!loadingSchedules && schedules.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 pt-10">
            {schedules.map((schedule) => {
              const currentId = getScheduleId(schedule)

              return (
                <div
                  key={currentId}
                  className="theme-card theme-text theme-border border-2 rounded-md p-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1 w-full">
                      <h2 className="w-full flex justify-center items-center">
                        <span className="font-bold text-md">
                          {schedule.repeat_type}
                        </span>
                      </h2>
                      <h2>
                        <span className="font-bold text-md">Type: </span>
                        {schedule.category}
                      </h2>
                      <h2>
                        <span className="font-bold text-md">Amount: </span>
                        ₱{Number(schedule.amount).toFixed(2)}
                      </h2>
                      <h2>
                        <span className="font-bold text-md">
                          Description:{' '}
                        </span>
                        {schedule.description}
                      </h2>
                      <h2>
                        <span className="font-bold text-md">Due: </span>
                        {formatDate(schedule.due_date)}
                      </h2>
                    </div>
                  </div>

                  <div className="flex justify-end flex-row pt-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(schedule)}
                      className="p-2 rounded-md theme-text theme-hover"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSchedule(schedule)
                        setShowDelete(true)
                      }}
                      className="p-2 rounded-md theme-text theme-hover"
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

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowEdit(false)
                setSelectedSchedule(null)
              }
            }}
          />
          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xl">Edit Schedule</h2>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowEdit(false)
                  setSelectedSchedule(null)
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
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
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
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Repeat</label>
                <select
                  value={editRepeatType}
                  onChange={(e) => setEditRepeatType(e.target.value)}
                  className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                >
                  <option value="">Select repeat</option>
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
                  onClick={() => {
                    setShowEdit(false)
                    setSelectedSchedule(null)
                  }}
                  disabled={loading}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSchedule}
                  disabled={loading}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!loading) {
                setShowDelete(false)
                setSelectedSchedule(null)
              }
            }}
          />
          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-2 p-4 sm:p-6 theme-card theme-text theme-border">
            <div className="relative flex items-center justify-between mb-6">
              <h2 className="font-mono text-md">
                Are you sure to delete this schedule?
              </h2>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowDelete(false)
                  setSelectedSchedule(null)
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
                  setSelectedSchedule(null)
                }}
                disabled={loading}
                className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSchedule}
                disabled={loading}
                className="bg-red-500 w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
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
              <h2 className="font-mono text-xl">Add Schedule</h2>
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
                  <option value="">Select repeat</option>
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
                  onClick={() => setShowAdd(false)}
                  disabled={loading}
                  className="w-full border-2 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  disabled={loading}
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