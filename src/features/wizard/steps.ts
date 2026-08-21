import type { ComponentType } from 'react'
import LoanTypeStep from '../steps/LoanTypeStep'
import PersonalStep from '../steps/PersonalStep'
import ContactStep from '../steps/ContactStep'
import EmploymentStep from '../steps/EmploymentStep'
import PlaceholderStep from '../steps/PlaceholderStep'

export interface StepProps {
  onContinue: () => void
  label?: string
  milestone?: number
}

export interface StepDef {
  id: string
  label: string
  milestone: number
  component: ComponentType<StepProps>
}

export const STEPS: StepDef[] = [
  { id: 'loan-type', label: 'Type de prêt', milestone: 2, component: LoanTypeStep },
  { id: 'personal', label: 'Informations personnelles', milestone: 3, component: PersonalStep },
  { id: 'contact', label: 'Adresse & contact', milestone: 3, component: ContactStep },
  { id: 'employment', label: 'Situation professionnelle', milestone: 3, component: EmploymentStep },
  { id: 'loan-details', label: 'Détails du prêt', milestone: 4, component: PlaceholderStep },
  { id: 'documents', label: 'Documents justificatifs', milestone: 5, component: PlaceholderStep },
  { id: 'kyc', label: 'Vérification KYC', milestone: 6, component: PlaceholderStep },
  { id: 'signature', label: 'Signature électronique', milestone: 6, component: PlaceholderStep },
  { id: 'summary', label: 'Récapitulatif & pré-approbation', milestone: 7, component: PlaceholderStep },
]
