import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { auth } from '../../firebase'

export const Salary = () => {

  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [salary, setSalary] = useState('')

  // ==========================================
  // ADD SALARY
  // ==========================================
  const handleAddSalary = async () => {
    if (!salary) {
      alert('Please fill in the salary text box')
      return
    }

    try {
      setLoading(true)

      const user = auth.currentUser
      if (!user) {
        throw new Error('You must be logged in first')
      }

      const token = await user.getIdToken()

      const response = await fetch('http://localhost:5000/api/users/salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          salary: Number(salary),
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
        throw new Error(data.message || 'Failed to add salary')
      }

      setSalary('')
      setShowAdd(false)

    } catch (error) {
      console.error('Salary Error:', error)
      alert(error.message || 'Failed to add salary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full flex justify-center'>
      <div className='flex flex-row gap-20'>

        <div className='space-y-4'>
          <h1 className='font-mono text-lg'>
            Monthly Salary
          </h1>

          <button
            type='button'
            onClick={() => setShowAdd(true)}
            className=' theme-bg theme-hover border-2 w-full theme-border border-2 rounded-md flex flex-col justify-center items-center h-20'
          >
            <Plus size={25} />
          </button>
        </div>

        {/* ADD SALARY POPUP */}
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
                <h2 className="font-mono text-xl">Add Monthly Salary</h2>

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
                  <label className="font-mono text-md">Salary</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Ex. 15,000"
                    className="w-full rounded-md border-2 px-3 py-2 outline-none theme-bg theme-text theme-border"
                  />
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAddSalary}
                 className="theme-bg theme-hover border-2 w-full rounded-md py-2 font-mono disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <h1 className='font-mono text-lg'>
            Monthly Transaction
          </h1>
        </div>

        <div>
          <h1 className='font-mono text-lg'>
            Monthly Schedule
          </h1>
        </div>

        <div>
          <h1 className='font-mono text-lg'>
            Monthly Spending
          </h1>
        </div>

      </div>
    </div>
  )
}