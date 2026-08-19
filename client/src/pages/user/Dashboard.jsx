import React from 'react'
import { Upperbar } from './Upperbar'
import { Sidebar } from './Sidebar'
import { Transaction } from './Transaction'
import { Account } from './Account.jsx'
import { Schedule } from './Schedule.jsx'
import { Analytics } from './Analytics.jsx'
 

export const Dashboard = () => {
  return (
    <div>
      <div>
        

        <Sidebar />
        <Upperbar/>
        
        
      </div>
    </div>
  )
}
