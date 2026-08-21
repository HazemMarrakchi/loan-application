import { z } from 'zod'
import type { LoanType } from '../types'
import { LOAN_TYPES, MIN_DOWN_PAYMENT_RATIO } from '../../data/loanTypes'
import {
  adultBirthDateSchema,
  cinSchema,
  emailSchema,
  matriculeFiscalSchema,
  phoneSchema,
  postalCodeSchema,
} from './rules'

export const personalStepSchema = z.object({
  firstName: z.string().trim().min(2, 'Prénom requis'),
  lastName: z.string().trim().min(2, 'Nom requis'),
  birthDate: adultBirthDateSchema,
  nationalId: cinSchema,
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  dependents: z
    .number({ message: 'Nombre invalide' })
    .int()
    .min(0, 'Invalide')
    .max(15, 'Invalide'),
})

export const contactStepSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  address: z.object({
    street: z.string().trim().min(3, 'Adresse requise'),
    city: z.string().trim().min(2, 'Délégation requise'),
    governorate: z.string().min(2, 'Gouvernorat requis'),
    postalCode: postalCodeSchema,
  }),
})

export const employmentStepSchema = z
  .object({
    employmentStatus: z.enum(['salaried', 'self_employed', 'retired']),
    employerName: z.string().optional(),
    cnssNumber: z.string().optional(),
    jobTitle: z.string().optional(),
    hireDate: z.string().optional(),
    monthlySalary: z.number({ message: 'Montant invalide' }).optional(),
    otherIncome: z.number({ message: 'Montant invalide' }).min(0).default(0),
    existingMonthlyObligations: z.number({ message: 'Montant invalide' }).min(0).default(0),
    businessName: z.string().optional(),
    matriculeFiscal: z.string().optional(),
    annualRevenue: z.number({ message: 'Montant invalide' }).optional(),
    yearsInBusiness: z.number({ message: 'Nombre invalide' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.employmentStatus === 'salaried') {
      if (!data.employerName || data.employerName.trim().length < 2) {
        ctx.addIssue({ code: 'custom', path: ['employerName'], message: 'Employeur requis' })
      }
      if (!data.cnssNumber || !/^\d{8,10}$/.test(data.cnssNumber)) {
        ctx.addIssue({ code: 'custom', path: ['cnssNumber'], message: 'N° CNSS : 8 à 10 chiffres' })
      }
      if (!data.monthlySalary || data.monthlySalary < 200) {
        ctx.addIssue({ code: 'custom', path: ['monthlySalary'], message: 'Salaire mensuel requis (≥ 200 TND)' })
      }
    }
    if (data.employmentStatus === 'self_employed') {
      if (!data.businessName || data.businessName.trim().length < 2) {
        ctx.addIssue({ code: 'custom', path: ['businessName'], message: 'Nom de l’entreprise requis' })
      }
      if (!data.matriculeFiscal || !matriculeFiscalSchema.safeParse(data.matriculeFiscal).success) {
        ctx.addIssue({
          code: 'custom',
          path: ['matriculeFiscal'],
          message: 'Format attendu : 1234567/A/M/000',
        })
      }
      if (!data.annualRevenue || data.annualRevenue < 5_000) {
        ctx.addIssue({ code: 'custom', path: ['annualRevenue'], message: 'Chiffre d’affaires annuel requis' })
      }
      if (!data.yearsInBusiness || data.yearsInBusiness < 1) {
        ctx.addIssue({ code: 'custom', path: ['yearsInBusiness'], message: 'Minimum 1 an d’activité' })
      }
    }
    if (data.employmentStatus === 'retired') {
      if (!data.monthlySalary || data.monthlySalary < 200) {
        ctx.addIssue({ code: 'custom', path: ['monthlySalary'], message: 'Pension mensuelle requise (≥ 200 TND)' })
      }
    }
  })

export function loanDetailsStepSchema(loanType: LoanType) {
  const config = LOAN_TYPES[loanType]
  return z
    .object({
      amount: z.number({ message: 'Montant requis' }),
      durationMonths: z.number({ message: 'Durée requise' }),
      loanPurpose: z.string().optional(),
      propertyPrice: z.number({ message: 'Prix invalide' }).optional(),
      downPayment: z.number({ message: 'Apport invalide' }).optional(),
    })
    .superRefine((data, ctx) => {
      if (!Number.isFinite(data.amount) || data.amount <= 0) {
        ctx.addIssue({ code: 'custom', path: ['amount'], message: 'Montant requis' })
        return
      }
      if (data.amount < config.minAmount || data.amount > config.maxAmount) {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: `Entre ${config.minAmount.toLocaleString('fr-TN')} et ${config.maxAmount.toLocaleString('fr-TN')} TND`,
        })
      }
      if (!Number.isFinite(data.durationMonths) || data.durationMonths <= 0) {
        ctx.addIssue({ code: 'custom', path: ['durationMonths'], message: 'Durée requise' })
        return
      }
      if (data.durationMonths < config.minMonths || data.durationMonths > config.maxMonths) {
        ctx.addIssue({
          code: 'custom',
          path: ['durationMonths'],
          message: `Entre ${config.minMonths} et ${config.maxMonths} mois`,
        })
      }

      if (loanType === 'home') {
        if (!Number.isFinite(data.propertyPrice ?? NaN) || (data.propertyPrice ?? 0) < 10_000) {
          ctx.addIssue({
            code: 'custom',
            path: ['propertyPrice'],
            message: 'Prix du bien requis (≥ 10 000 TND)',
          })
        } else if (
          !Number.isFinite(data.downPayment ?? NaN) ||
          (data.downPayment ?? 0) < (data.propertyPrice ?? 0) * MIN_DOWN_PAYMENT_RATIO
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['downPayment'],
            message: `Apport minimum : ${Math.round((data.propertyPrice ?? 0) * MIN_DOWN_PAYMENT_RATIO).toLocaleString('fr-TN')} TND (10 %)`,
          })
        }
      } else if (!data.loanPurpose) {
        ctx.addIssue({
          code: 'custom',
          path: ['loanPurpose'],
          message: loanType === 'business' ? 'Objet du financement requis' : 'Motif requis',
        })
      }
    })
}

export function documentsStepSchema(loanType: LoanType) {
  const required = LOAN_TYPES[loanType].requiredDocuments
  return z
    .object({
      documents: z.array(
        z.object({
          id: z.string(),
          kind: z.string(),
          fileName: z.string(),
          originalSizeBytes: z.number(),
          compressedSizeBytes: z.number(),
          dataUrl: z.string(),
          uploadedAt: z.string(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      for (const kind of required) {
        if (!data.documents.some((doc) => doc.kind === kind)) {
          ctx.addIssue({
            code: 'custom',
            path: ['documents'],
            message: `Pièce manquante : ${LOAN_TYPES[loanType].documentLabels[kind] ?? kind}`,
          })
        }
      }
    })
}

export const signatureStepSchema = z.object({
  signatureDataUrl: z
    .string()
    .min(50, 'Signature requise')
    .refine((value) => value.startsWith('data:image/png;base64,'), 'Format de signature invalide'),
})
