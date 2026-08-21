import { z } from 'zod'
import type { LoanType } from '../types'
import { LOAN_TYPES, MIN_DOWN_PAYMENT_RATIO } from '../../data/loanTypes'
import {
  adultBirthDateSchema,
  cinSchema,
  emailSchema,
  moneyField,
  matriculeFiscalSchema,
  phoneSchema,
  postalCodeSchema,
} from './rules'

export const loanStepSchema = z
  .object({
    loanType: z.enum(['personal', 'home', 'business']),
    amount: z.coerce.number({ message: 'Montant requis' }).positive('Montant requis'),
    durationMonths: z.coerce.number({ message: 'Durée requise' }).int().positive(),
  })
  .superRefine((data, ctx) => {
    const config = LOAN_TYPES[data.loanType]
    if (data.amount < config.minAmount || data.amount > config.maxAmount) {
      ctx.addIssue({
        code: 'custom',
        path: ['amount'],
        message: `Entre ${config.minAmount.toLocaleString('fr-TN')} et ${config.maxAmount.toLocaleString('fr-TN')} TND`,
      })
    }
    if (data.durationMonths < config.minMonths || data.durationMonths > config.maxMonths) {
      ctx.addIssue({
        code: 'custom',
        path: ['durationMonths'],
        message: `Entre ${config.minMonths} et ${config.maxMonths} mois`,
      })
    }
  })

export const personalStepSchema = z.object({
  firstName: z.string().trim().min(2, 'Prénom requis'),
  lastName: z.string().trim().min(2, 'Nom requis'),
  birthDate: adultBirthDateSchema,
  nationalId: cinSchema,
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  dependents: z.coerce.number().int().min(0, 'Invalide').max(15, 'Invalide'),
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
    monthlySalary: z.coerce.number().optional(),
    otherIncome: z.coerce.number().min(0).default(0),
    existingMonthlyObligations: z.coerce.number().min(0).default(0),
    businessName: z.string().optional(),
    matriculeFiscal: z.string().optional(),
    annualRevenue: z.coerce.number().optional(),
    yearsInBusiness: z.coerce.number().optional(),
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
  if (loanType === 'personal') {
    return z.object({
      loanPurpose: z.enum(['treasury', 'renovation', 'travel', 'wedding', 'education', 'other'], {
        message: 'Motif requis',
      }),
    })
  }
  if (loanType === 'home') {
    return z
      .object({
        propertyPrice: moneyField(10_000, 1_000_000, 'Prix du bien'),
        downPayment: moneyField(0, 1_000_000, 'Apport personnel'),
      })
      .superRefine((data, ctx) => {
        const minDown = data.propertyPrice * MIN_DOWN_PAYMENT_RATIO
        if (data.downPayment < minDown) {
          ctx.addIssue({
            code: 'custom',
            path: ['downPayment'],
            message: `Apport minimum : ${Math.round(minDown).toLocaleString('fr-TN')} TND (10 %)`,
          })
        }
      })
  }
  return z.object({
    loanPurpose: z.enum(['working_capital', 'equipment', 'expansion', 'other'], {
      message: 'Objet du financement requis',
    }),
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
