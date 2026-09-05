
import { AmountSalary } from "./singlepurpose/AmountSalary"
import { BillAmount } from "./singlepurpose/BillAmount"

export const Index = () => {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-semibold">Here's your financial overview.</h1>

      <div className="flex flex-col gap-4 mt-6">

    
      <AmountSalary />
      <BillAmount />
      
       
       

        

        </div>
    </div>
  )
}