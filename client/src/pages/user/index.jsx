
import { AmountSalary } from "./singlepurpose/AmountSalary"
import { BillAmount } from "./singlepurpose/BillAmount"
import { MInusSalary } from "./singlepurpose/MInusSalary"
export const Index = () => {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-semibold">Here's your financial overview.</h1>

      <div className="flex flex-row gap-4 mt-6 pt-20">

    
      <AmountSalary />
      <BillAmount />
      <MInusSalary />
      
       
       

        

        </div>
    </div>
  )
}