import React from 'react'
import { Pencil } from 'lucide-react'
export const Account = () => {
  return (

    <div className='w-full'>
      <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">
          

              <h1 className="font-mono text-lg sm:text-2xl theme-text">
                Account
              </h1>

      </div>
    
        


        <div className="flex flex-col items-center pt-15">
          <div className="flex items-center justify-center border-2 rounded-md h-32 w-32 ">
            {/* Image or icon here */}
          </div>

          <div className='flex flex-row'>

            <h1 className="font-mono text-lg text-center mt-2">
            
            Name
            
            </h1>
            <h1>
              <Pencil size={20} />
            </h1>

            
          </div>
          
          <h1 className="font-mono text-lg text-center mt-2">
            Email
          </h1>
        </div>
    </div>
  )
}
