import { AmountSalary } from "./singlepurpose/AmountSalary"
import { BillAmount } from "./singlepurpose/BillAmount"
import { MInusSalary } from "./singlepurpose/MInusSalary"

export const Index = () => {
  return (
    <div className="text-white px-4 sm:px-6 md:px-10">
      <h1 className="text-xl sm:text-2xl font-semibold">Here's your financial overview.</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 pt-10 sm:pt-20">
        <AmountSalary />
        <BillAmount />
        <MInusSalary />
      </div>
    </div>
  )
}