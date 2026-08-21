import type { ApplicationDraft } from '../types'
import { LOAN_TYPES } from '../../data/loanTypes'
import { computeEligibility } from '../services/eligibility'

export interface CrossStepIssue {
  field: string
  message: string
}

export function validateCrossStep(draft: ApplicationDraft): CrossStepIssue[] {
  const issues: CrossStepIssue[] = []
  const config = LOAN_TYPES[draft.loanType]

  const monthlyIncome =
    draft.employmentStatus === 'self_employed'
      ? (draft.annualRevenue ?? 0) / 12
      : (draft.monthlySalary ?? 0)

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
    const financed = draft.amount + (draft.downPayment ?? 0)
    if ((draft.propertyPrice ?? 0) > 0 && Math.abs(financed - (draft.propertyPrice ?? 0)) > 1) {
      issues.push({
        field: 'amount',
        message: `Montant + apport doit égaliser le prix du bien (${(draft.propertyPrice ?? 0).toLocaleString('fr-TN')} TND)`,
      })
    }
    if (draft.durationMonths > 300 - (new Date().getFullYear() - new Date(draft.birthDate).getFullYear())) {
      issues.push({
        field: 'durationMonths',
        message: 'Durée du crédit immobilier limitée par l’âge d’échéance (75 ans).',
      })
    }
  }

  if (draft.loanType === 'business' && draft.employmentStatus === 'self_employed') {
    const requested = draft.amount
    const revenue = draft.annualRevenue ?? 0
    if (revenue > 0 && requested > revenue * 0.5) {
      issues.push({
        field: 'amount',
        message: `Le montant ne peut dépasser 50 % du chiffre d’affaires annuel (${Math.floor(revenue * 0.5).toLocaleString('fr-TN')} TND)`,
      })
    }
  }

  return issues
}
