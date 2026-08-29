import React from 'react'
import { SalesChart } from '../../components/SalesChart'

export const Analytics = () => {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center px-4 sm:px-8 md:px-12 lg:px-20 gap-4">

      <h1 className="font-mono text-lg sm:text-2xl theme-text">
        Analytics
      </h1>

     <div className="w-full h-96 flex-1">
        <SalesChart />
      </div>

    </div>
  )
}