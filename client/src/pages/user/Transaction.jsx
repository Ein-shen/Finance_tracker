import React from 'react'
import { Plus } from 'lucide-react'

export const Transaction = () => {
  return (
    <div className="w-full flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">

      <h1 className="font-mono text-lg sm:text-xl">
        Transaction
      </h1>

      <button
        className="flex items-center justify-center gap-1 sm:gap-2 font-mono text-sm sm:text-md border-2 rounded-md px-3 py-2 shrink-0 hover:bg-white hover:text-black"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>

    </div>
  )
}