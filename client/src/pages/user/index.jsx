import React from 'react'

export const Index = () => {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-400">
        Here's your financial overview.
      </p>

      <div className="grid grid-cols-4 gap-4 mt-6">

        <div className="border border-gray-500 rounded-xl p-5">
          <p className="text-gray-400">Total Balance</p>
          <h2 className="text-2xl mt-2">₱25,500.00</h2>
        </div>

        <div className="border border-gray-500 rounded-xl p-5">
          <p className="text-gray-400">Total Income</p>
          <h2 className="text-2xl mt-2">₱40,000.00</h2>
        </div>

        

        </div>
    </div>
  )
}