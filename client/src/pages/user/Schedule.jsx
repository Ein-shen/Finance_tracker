import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, X, Pencil, Trash2, Utensils, Car, ShoppingBag, Receipt, Film, Wallet, ChevronDown, Check } from 'lucide-react'
import { auth } from '../../firebase'
import { API_URL } from '../../api.js'
import { HashLoader } from "react-spinners"
// ==========================================
// LOCAL STORAGE CACHE KEY
// ==========================================
//prefix the key with the user's uid so that if two different
// people ever log in on the same browser/device, one user's cached
// schedules never leak into another user's view.
// Result looks like: "cachedSchedules_abc123uid"
const CACHE_KEY_PREFIX = 'cachedSchedules_'
const getCacheKey = (uid) => `${CACHE_KEY_PREFIX}${uid}`

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
  const [authLoading, setAuthLoading] = useState(true)

  // ==========================================
  // SCHEDULES & SELECTION
  // ==========================================

  // STEP 1: Read from localStorage the moment this component is created.
  //
  // The function passed to useState() only runs ONCE, on first render.
  // This is called "lazy initial state" — it lets us read from
  // localStorage synchronously (no waiting, no async) so the very
  // first paint of the screen already has data in it, instead of
  // showing a blank/loading screen while we wait for Firebase + fetch.
  //
  // At this exact moment we don't know WHICH user is logged in yet
  // (Firebase auth hasn't resolved), so we just grab whatever
  // schedule cache exists on this device as a "good enough" guess.
  // It gets corrected below in the auth listener once we know the uid.
  const [schedules, setSchedules] = useState(() => {
    try {
      // Find any key on this device that starts with our cache prefix
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(CACHE_KEY_PREFIX)
      )
      if (keys.length === 0) return [] // nothing cached yet, start empty

      const cached = localStorage.getItem(keys[0])
      // localStorage only stores strings, so we JSON.parse it back
      // into a real array of schedule objects.
      return cached ? JSON.parse(cached) : []
    } catch (e) {
      // If the cached string is corrupted/invalid JSON, don't crash —
      // just fall back to an empty list.
      console.error('Failed to read schedule cache on init:', e)
      return []
    }
  })

  // STEP 2: Only show a full "Loading schedules..." message if we
  // truly have nothing to show yet. If we already loaded something
  // from cache above, skip the loading screen entirely.
  const [loadingSchedules, setLoadingSchedules] = useState(
    () => schedules.length === 0
  )

  // MONTH FILTER - value is either '' (show all) or 'YYYY-MM'
  const [filterMonth, setFilterMonth] = useState('')

  // MONTH DROPDOWN - open/closed state + ref to the wrapper element
  const [monthOpen, setMonthOpen] = useState(false)
  const monthMenuRef = useRef(null)

  // close the month dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!monthOpen) return

    const handleClickOutside = (e) => {
      if (monthMenuRef.current && !monthMenuRef.current.contains(e.target)) {
        setMonthOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMonthOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [monthOpen])

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

  // Category icon shown in the card's icon tile
  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'food': return <Utensils size={19} />
      case 'transportation': return <Car size={19} />
      case 'shopping': return <ShoppingBag size={19} />
      case 'bills': return <Receipt size={19} />
      case 'entertainment': return <Film size={19} />
      default: return <Wallet size={19} />
    }
  }

  // STEP 3: Small helper to save the current list to localStorage.
  // We call this every time the list changes (after add/edit/delete/fetch)
  // so the cache never goes stale compared to what's on screen.
  //
  // Wrapped in try/catch because localStorage CAN throw — e.g. if the
  // browser's storage quota is full, or the user is in private/incognito
  // mode with storage disabled. We don't want that to crash the app.
  const saveCache = (uid, data) => {
    try {
      if (!uid) return // safety check — never write without a real user id
      localStorage.setItem(getCacheKey(uid), JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save schedule cache:', e)
    }
  }

  // ==========================================
  // FIREBASE AUTH LISTENER
  // ==========================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // STEP 4: Now that we KNOW the real user, re-check localStorage
        // using their exact uid. This corrects the "best guess" cache
        // we loaded in Step 1 (which might have been empty, or, on a
        // shared device, might have belonged to a different user).
        try {
          const cached = localStorage.getItem(getCacheKey(user.uid))
          if (cached) {
            setSchedules(JSON.parse(cached))
            setLoadingSchedules(false) // we have real data, stop the spinner
          }
        } catch (e) {
          console.error('Failed to read schedule cache for user:', e)
        }
      } else {
        // No user logged in — clear what's on screen.
        // (We don't delete the cache file itself; it's harmless sitting
        // there keyed by uid, and will be picked back up if they log
        // back in on the same device.)
        setSchedules([])
      }

      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  // ==========================================
  // GET SCHEDULES
  // ==========================================
  const fetchSchedules = async () => {
    try {
      const user = auth.currentUser

      if (!user) {
        setSchedules([])
        setLoadingSchedules(false)
        return
      }

      // STEP 5: Only show the blocking "Loading..." text if the screen
      // is currently empty. If cached data is already showing, this
      // fetch happens quietly in the background — the user just sees
      // the list update (or not change at all) once it resolves.
      setLoadingSchedules((prev) => (schedules.length === 0 ? true : prev))

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

      const freshSchedules = data.schedules || []

      // STEP 6: Update BOTH the on-screen state AND the cache together.
      // This keeps them in sync — next time the component mounts,
      // Step 1/4 will read this exact fresh data back out.
      setSchedules(freshSchedules)
      saveCache(user.uid, freshSchedules)
    } catch (error) {
      console.error('Get schedules error:', error)
      // Only alert the user if the screen is empty. If cached data is
      // already showing, a background fetch failure shouldn't interrupt
      // them with a popup — they still have something useful on screen.
      if (schedules.length === 0) {
        alert(error.message || 'Failed to get schedules')
      }
    } finally {
      setLoadingSchedules(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchSchedules()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // STEP 7: Whenever we change the list with setSchedules, we pass a
      // callback so we have access to "prev" (the list right before the
      // change). We compute "updated", write it to localStorage via
      // saveCache, THEN return it so React also updates the screen.
      // This one block keeps the screen and the cache perfectly in sync.
      setSchedules((prev) => {
        const updated = prev.filter((item) => getScheduleId(item) !== targetId)
        saveCache(user.uid, updated)
        return updated
      })

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

      // Same pattern: update state + cache together.
      setSchedules((prev) => {
        const updated = [data.schedule, ...prev]
        saveCache(user.uid, updated)
        return updated
      })

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

  // Updates the screen + cache right away and closes the popup,
  // then saves to the server in the background. If the server
  // fails, the change is rolled back.
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

    const user = auth.currentUser
    if (!user) {
      alert('You must be logged in first')
      return
    }

    const previousSchedules = schedules // saved in case we need to roll back

    // 1. update the screen + cache right away
    const optimisticItem = {
      ...selectedSchedule,
      description: editDescription,
      amount: Number(editAmount),
      category: editCategory,
      due_date: editDueDate,
      repeat_type: editRepeatType,
    }
    const optimisticList = schedules.map((item) =>
      getScheduleId(item) === targetId ? optimisticItem : item
    )
    setSchedules(optimisticList)
    saveCache(user.uid, optimisticList)

    // 2. close the popup immediately
    setShowEdit(false)
    setSelectedSchedule(null)

    // 3. save to the server in the background
    try {
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

      // swap in the real server version
      setSchedules((prev) => {
        const updated = prev.map((item) =>
          getScheduleId(item) === targetId ? data.schedule : item
        )
        saveCache(user.uid, updated)
        return updated
      })
    } catch (error) {
      console.error('Edit schedule error:', error)
      // 4. server failed, so undo the change
      setSchedules(previousSchedules)
      saveCache(user.uid, previousSchedules)
      alert(error.message || 'Failed to edit schedule')
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

  // ==========================================
  // MONTH FILTER
  // ==========================================

  // Builds 'YYYY-MM' from a schedule's due_date, safely.
  // Applies the same timezone-offset correction as formatDate so the
  // month bucket a schedule falls into matches what's shown on screen.
  const getYearMonth = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''
    const local = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    const year = local.getFullYear()
    const month = String(local.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  const filteredSchedules = useMemo(() => {
    if (!filterMonth) return schedules
    return schedules.filter((s) => getYearMonth(s.due_date) === filterMonth)
  }, [schedules, filterMonth])

  // Human readable label for a 'YYYY-MM' value, e.g. "September 2026"
  const getMonthLabel = (ym) => {
    if (!ym) return ''
    const [year, month] = ym.split('-')
    const d = new Date(Number(year), Number(month) - 1, 1)
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }

  const filterMonthLabel = useMemo(() => getMonthLabel(filterMonth), [filterMonth])

  // Distinct 'YYYY-MM' values actually present in the data, newest first
  const availableMonths = useMemo(() => {
    const set = new Set()
    schedules.forEach((s) => {
      const ym = getYearMonth(s.due_date)
      if (ym) set.add(ym)
    })
    return Array.from(set).sort().reverse()
  }, [schedules])


  // with "Checking login..." while authLoading was true. That was the
  // main cause of the visible delay — it hid the cached data we already
  // have. Now we just show a small inline note in the header instead,
  // and let the schedule list render immediately underneath it.

  return (
    <div className="w-full md:pt-0">
      {/* HEADER */}
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20">
        <h1 className="font-mono text-xl sm:text-2xl theme-text">
          Schedule
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

      {/* MONTH FILTER BAR */}
      <div className="mt-4 px-4 sm:px-8 md:px-12 lg:px-20 flex flex-wrap items-center gap-3">
        <div ref={monthMenuRef} className="relative">
          {/* trigger button */}
          <button
            type="button"
            onClick={() => setMonthOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={monthOpen}
            className="flex items-center  rounded-md gap-2 py-1.5 font-mono text-sm theme-bg theme-text theme-border theme-hover"
          >
            <span>{filterMonth ? filterMonthLabel : 'All Schedules'}</span>
            <ChevronDown
              size={18}
              className={`opacity-60 transition-transform duration-200 ${monthOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* dropdown menu */}
          {monthOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full z-40 mt-2 max-h-64 min-w-full w-52 overflow-y-auto rounded-xl border border-white/10 theme-card shadow-lg"
            >
              {[
                { value: '', label: 'All Schedules' },
                ...availableMonths.map((ym) => ({ value: ym, label: getMonthLabel(ym) })),
              ].map((opt) => {
                const isSelected = opt.value === filterMonth
                return (
                  <button
                    key={opt.value || 'all'}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setFilterMonth(opt.value)
                      setMonthOpen(false)
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left font-mono text-sm theme-text transition hover:bg-white/10"
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={16} className="opacity-70" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* SCHEDULE LIST */}
      <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-20">
        {/* Only show the loading text if we have NOTHING cached to show */}
        {loadingSchedules && schedules.length === 0 && (
          <HashLoader
            
            size={20}
            color="#dddfe9"
          />
        )}

        {!loadingSchedules && schedules.length === 0 && (
          <p className="theme-text font-mono">No schedules yet.</p>
        )}

        {!loadingSchedules &&
          schedules.length > 0 &&
          filteredSchedules.length === 0 && (
            <p className="theme-text font-mono">
              No schedules for {filterMonthLabel || 'this period'}.
            </p>
          )}

        {filteredSchedules.length > 0 && (
          <div className=" space-y-5 pt-10">
            {filteredSchedules.map((schedule) => {
              const currentId = getScheduleId(schedule)

              return (
                <div
                  key={currentId}
                  className="theme-card border-b theme-border theme-text w-full rounded-2xl border-white/10 border-1 hover:border-white/25 p-5 transition-all duration-200 hover:-translate-y-[1px]"
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-black/5 dark:bg-white/10">
                        {getCategoryIcon(schedule.category)}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold capitalize">{schedule.category}</h2>
                        <p className="mt-1 text-md text-green-500 ">{schedule.repeat_type}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <p className="text-xs opacity-40">Due date</p>
                      <p className="mt-1 text-sm text-red-500 font-medium">{formatDate(schedule.due_date)}</p>
                    </div>
                  </div>

                  <div className="my-5 h-px w-full bg-theme border-b theme-border bg-black/10 dark:bg-white/10" />

                  {/* BOTTOM */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm opacity-50 capitalize ">{schedule.description}</p>
                      <p className="mt-1 text-sm font-medium text-red-500">-₱{Number(schedule.amount).toFixed(2)}</p>
                    </div>

                    <div className="flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(schedule)}
                        className="rounded-lg p-2 theme-hover theme-border opacity-50 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10 hover:text-green-500"
                      >
                        <Pencil  size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchedule(schedule)
                          setShowDelete(true)
                        }}
                        className="rounded-lg theme-hover p-2 opacity-50 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10 theme-text hover:text-red-500"
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
          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6 theme-card theme-text theme-border">
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
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Repeat</label>
                <select
                  value={editRepeatType}
                  onChange={(e) => setEditRepeatType(e.target.value)}
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSchedule}
                  disabled={loading}
                  className="w-full border border-white/10 bg-blue-500 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
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
          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6 theme-card theme-text theme-border">
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
                className="w-full  rounded-md border border-white/10 py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSchedule}
                disabled={loading}
                className="bg-red-500 w-full border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
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
          <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl  p-4 sm:p-6 theme-card theme-text theme-border">
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
                  className="w-full rounded-md px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm">Repeat</label>
                <select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value)}
                  className="w-full rounded-md  px-3 py-2 outline-none theme-bg theme-text theme-border"
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
                  className="w-full border border-white/10 rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  disabled={loading}
                  className="w-full border border-white/10  bg-green-500  rounded-md py-2 font-mono theme-text theme-border theme-hover disabled:opacity-50"
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