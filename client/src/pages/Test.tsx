import React from 'react'
import InvestmentList from '../components/InvestmentList/InvestmentList'
import { mockInvestments } from '../mockData/investmentMock'
import { Investment } from '../types/investment'
const Test = () => {    
  return (
    <InvestmentList investments={mockInvestments as Investment[]} onOpenInvestmentModal={() => {}} />
  )
}

export default Test