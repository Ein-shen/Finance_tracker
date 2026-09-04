import React from 'react'
import { Plus } from 'lucide-react'
export const Salary = () => {
  return (
    <div className='w-full flex justify-center'>
        <div className='flex flex-row gap-20'>

          <div className='space-y-4'>

               <h1 className='font-mono text-lg'>
                Monthly Salary
                </h1>

                
                <button className=' w-full theme-border border-2 rounded-md flex justify-center h-20 flex flex-col items-center'>
                  
                  <Plus size={25} />
                </button>

          </div>

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
