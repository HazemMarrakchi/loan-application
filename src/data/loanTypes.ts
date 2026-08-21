import type { DocumentKind, LoanType } from '../core/types'

export interface LoanTypeConfig {
  label: string
  description: string
  minAmount: number
  maxAmount: number
  minMonths: number
  maxMonths: number
  annualRate: number
  requiredDocuments: DocumentKind[]
  documentLabels: Record<string, string>
}

export const LOAN_TYPES: Record<LoanType, LoanTypeConfig> = {
  personal: {
    label: 'Crédit Personnel',
    description: 'Trésorerie, travaux, voyage, mariage ou tout autre projet personnel.',
    minAmount: 1_000,
    maxAmount: 60_000,
    minMonths: 6,
    maxMonths: 60,
    annualRate: 0.079,
    requiredDocuments: ['cin_recto', 'cin_verso', 'payslip', 'bank_statement'],
    documentLabels: {
      cin_recto: 'CIN — recto',
      cin_verso: 'CIN — verso',
      payslip: 'Bulletin de paie (3 derniers mois)',
      bank_statement: 'Relevé bancaire (3 derniers mois)',
    },
  },
  home: {
    label: 'Crédit Immobilier',
    description: 'Achat de résidence principale ou secondaire, construction ou extension.',
    minAmount: 20_000,
    maxAmount: 600_000,
    minMonths: 36,
    maxMonths: 300,
    annualRate: 0.059,
    requiredDocuments: [
      'cin_recto',
      'cin_verso',
      'payslip',
      'bank_statement',
      'work_certificate',
      'property_deed',
      'property_insurance',
    ],
    documentLabels: {
      cin_recto: 'CIN — recto',
      cin_verso: 'CIN — verso',
      payslip: 'Bulletin de paie (3 derniers mois)',
      bank_statement: 'Relevé bancaire (6 derniers mois)',
      work_certificate: 'Attestation de travail',
      property_deed: 'Acte de propriété ou promesse de vente',
      property_insurance: 'Devis d’assurance habitation',
    },
  },
  business: {
    label: 'Crédit Professionnel',
    description: 'Fonds de roulement, équipement ou expansion pour votre entreprise.',
    minAmount: 5_000,
    maxAmount: 500_000,
    minMonths: 12,
    maxMonths: 120,
    annualRate: 0.089,
    requiredDocuments: [
      'cin_recto',
      'cin_verso',
      'patent',
      'commerce_register',
      'vat_declaration',
      'bank_statement',
    ],
    documentLabels: {
      cin_recto: 'CIN du gérant — recto',
      cin_verso: 'CIN du gérant — verso',
      patent: 'Patente en cours de validité',
      commerce_register: 'Registre de commerce (RNE)',
      vat_declaration: 'Déclaration TVA (dernier trimestre)',
      bank_statement: 'Relevé bancaire professionnel (6 mois)',
    },
  },
}

export const LOAN_TYPE_ORDER: LoanType[] = ['personal', 'home', 'business']

export const FOIR_LIMIT = 0.4
export const MIN_DOWN_PAYMENT_RATIO = 0.1
