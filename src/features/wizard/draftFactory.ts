import type { ApplicationDraft, EmploymentStatus } from '../../core/types'

export function createEmptyDraft(): ApplicationDraft {
  return {
    loanType: 'personal',
    amount: 0,
    durationMonths: 0,

    firstName: '',
    lastName: '',
    birthDate: '',
    nationalId: '',
    maritalStatus: 'single',
    dependents: 0,

    email: '',
    phone: '',
    address: { street: '', city: '', governorate: '', postalCode: '' },

    employmentStatus: 'salaried' as EmploymentStatus,
    otherIncome: 0,
    existingMonthlyObligations: 0,

    documents: [],
  }
}

export function isDraftEmpty(draft: ApplicationDraft): boolean {
  if (draft.amount > 0 || draft.durationMonths > 0) return false
  if (draft.firstName || draft.lastName || draft.nationalId) return false
  if (draft.documents.length > 0) return false
  return true
}
