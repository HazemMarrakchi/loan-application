import type { EligibilityInput, EligibilityResult } from '../types'
import { FOIR_LIMIT } from '../../data/loanTypes'

export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0
  const r = annualRate / 12
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

export function maxAffordablePrincipal(maxInstallment: number, annualRate: number, months: number): number {
  if (months <= 0) return 0
  const r = annualRate / 12
  if (r === 0) return maxInstallment * months
  return maxInstallment * ((1 - Math.pow(1 + r, -months)) / r)
}

export function computeEligibility(input: EligibilityInput): EligibilityResult {
  const totalIncome = input.monthlyIncome + input.otherIncome
  const maxInstallment = Math.max(0, totalIncome * FOIR_LIMIT - input.existingMonthlyObligations)
  const maxEligibleAmount = maxAffordablePrincipal(maxInstallment, input.annualRate, input.durationMonths)
  const requestedEmi = monthlyPayment(input.amount, input.annualRate, input.durationMonths)
  const debtRatio = totalIncome > 0 ? (requestedEmi + input.existingMonthlyObligations) / totalIncome : Infinity

  if (input.amount <= maxEligibleAmount && maxInstallment > 0) {
    return { requestedEmi, maxInstallment, maxEligibleAmount, debtRatio, decision: 'approved' }
  }
  if (maxEligibleAmount >= 1_000) {
    return {
      requestedEmi,
      maxInstallment,
      maxEligibleAmount,
      debtRatio,
      decision: 'counter_offer',
      counterAmount: Math.floor(maxEligibleAmount / 100) * 100,
    }
  }
  return { requestedEmi, maxInstallment, maxEligibleAmount, debtRatio, decision: 'rejected' }
}
