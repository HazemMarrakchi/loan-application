import type { ApplicationDraft } from '../types'
import { LOAN_TYPES } from '../../data/loanTypes'
import { computeEligibility } from '../services/eligibility'

export interface CrossStepIssue {
  field: 'amount' | 'durationMonths'
  message: string
}

export function monthlyIncomeOf(draft: ApplicationDraft): number {
  if (draft.employmentStatus === 'self_employed') return (draft.annualRevenue ?? 0) / 12
  return draft.monthlySalary ?? 0
}

export function validateCrossStep(draft: ApplicationDraft): CrossStepIssue[] {
  const issues: CrossStepIssue[] = []
  const config = LOAN_TYPES[draft.loanType]
  const monthlyIncome = monthlyIncomeOf(draft)

  if (monthlyIncome > 0) {
    const eligibility = computeEligibility({
      monthlyIncome,
      otherIncome: draft.otherIncome,
      existingMonthlyObligations: draft.existingMonthlyObligations,
      amount: draft.amount,
      durationMonths: draft.durationMonths,
      annualRate: config.annualRate,
    })

    if (eligibility.decision === 'rejected') {
      issues.push({
        field: 'amount',
        message:
          'Capacité de remboursement insuffisante : réduisez le montant ou allongez la durée.',
      })
    } else if (eligibility.decision === 'counter_offer' && eligibility.counterAmount) {
      issues.push({
        field: 'amount',
        message: `Montant éligible maximum : ${eligibility.counterAmount.toLocaleString('fr-TN')} TND`,
      })
    }
  }

  if (draft.loanType === 'home') {
    const price = draft.propertyPrice ?? 0
    const financed = draft.amount + (draft.downPayment ?? 0)
    if (price > 0 && financed > price) {
      issues.push({
        field: 'amount',
        message: `Montant + apport ne peut dépasser le prix du bien (${price.toLocaleString('fr-TN')} TND)`,
      })
    }
    const age =
      new Date().getFullYear() - new Date(draft.birthDate).getFullYear()
    if (Number.isFinite(age) && age > 0 && draft.durationMonths / 12 > 75 - age) {
      issues.push({
        field: 'durationMonths',
        message: `Avec ${age} ans, la durée maximale est de ${Math.max(0, 75 - age)} ans (échéance à 75 ans).`,
      })
    }
  }

  if (draft.loanType === 'business' && draft.employmentStatus === 'self_employed') {
    const revenue = draft.annualRevenue ?? 0
    if (revenue > 0 && draft.amount > revenue * 0.5) {
      issues.push({
        field: 'amount',
        message: `Le montant ne peut dépasser 50 % du chiffre d’affaires annuel (${Math.floor(revenue * 0.5).toLocaleString('fr-TN')} TND)`,
      })
    }
  }

  return issues
}
