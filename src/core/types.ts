export type LoanType = 'personal' | 'home' | 'business'

export type EmploymentStatus = 'salaried' | 'self_employed' | 'retired'

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export interface AddressDraft {
  street: string
  city: string
  governorate: string
  postalCode: string
}

export type DocumentKind =
  | 'cin_recto'
  | 'cin_verso'
  | 'payslip'
  | 'bank_statement'
  | 'work_certificate'
  | 'patent'
  | 'commerce_register'
  | 'vat_declaration'
  | 'property_deed'
  | 'property_insurance'

export interface StoredDocument {
  id: string
  kind: DocumentKind
  fileName: string
  originalSizeBytes: number
  compressedSizeBytes: number
  dataUrl: string
  uploadedAt: string
}

export type KycField = 'nationalId' | 'matriculeFiscal'

export interface KycCheck {
  field: KycField
  status: 'pending' | 'verified' | 'rejected'
  message?: string
  checkedAt?: string
}

export interface EligibilityInput {
  monthlyIncome: number
  otherIncome: number
  existingMonthlyObligations: number
  amount: number
  durationMonths: number
  annualRate: number
}

export interface EligibilityResult {
  requestedEmi: number
  maxInstallment: number
  maxEligibleAmount: number
  debtRatio: number
  decision: 'approved' | 'counter_offer' | 'rejected'
  counterAmount?: number
}

export interface ApplicationDraft {
  loanType: LoanType
  amount: number
  durationMonths: number

  firstName: string
  lastName: string
  birthDate: string
  nationalId: string
  maritalStatus: MaritalStatus
  dependents: number

  email: string
  phone: string
  address: AddressDraft

  employmentStatus: EmploymentStatus
  employerName?: string
  cnssNumber?: string
  jobTitle?: string
  hireDate?: string
  monthlySalary?: number
  otherIncome: number
  existingMonthlyObligations: number

  businessName?: string
  matriculeFiscal?: string
  annualRevenue?: number
  yearsInBusiness?: number

  propertyPrice?: number
  downPayment?: number
  loanPurpose?: string

  documents: StoredDocument[]
  signatureDataUrl?: string
  kycPassed?: boolean
}
