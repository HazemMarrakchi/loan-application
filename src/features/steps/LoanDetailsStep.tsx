import { useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loanDetailsStepSchema } from '../../core/validation/schemas'
import { validateCrossStep, monthlyIncomeOf } from '../../core/validation/crossStep'
import { computeEligibility, monthlyPayment } from '../../core/services/eligibility'
import { LOAN_TYPES } from '../../data/loanTypes'
import type { ApplicationDraft } from '../../core/types'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'
import { NumberField, SelectField } from '../ui/fields'

interface FormValues {
  amount: number
  durationMonths: number
  loanPurpose?: string
  propertyPrice?: number
  downPayment?: number
}

const PERSONAL_PURPOSES = [
  { value: 'treasury', label: 'Trésorerie' },
  { value: 'renovation', label: 'Travaux / Rénovation' },
  { value: 'travel', label: 'Voyage' },
  { value: 'wedding', label: 'Mariage' },
  { value: 'education', label: 'Éducation' },
  { value: 'other', label: 'Autre' },
]

const BUSINESS_PURPOSES = [
  { value: 'working_capital', label: 'Fonds de roulement' },
  { value: 'equipment', label: 'Équipement / Matériel' },
  { value: 'expansion', label: 'Expansion / Local' },
  { value: 'other', label: 'Autre' },
]

export default function LoanDetailsStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()
  const config = LOAN_TYPES[draft.loanType]
  const [crossError, setCrossError] = useState<string | null>(null)

  const schema = useMemo(() => loanDetailsStepSchema(draft.loanType), [draft.loanType])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    mode: 'onTouched',
    defaultValues: {
      amount: draft.amount || undefined,
      durationMonths: draft.durationMonths || undefined,
      loanPurpose: draft.loanPurpose,
      propertyPrice: draft.propertyPrice,
      downPayment: draft.downPayment,
    },
  })

  const amount = watch('amount')
  const duration = watch('durationMonths')
  const propertyPrice = watch('propertyPrice')

  const capacity = useMemo(() => {
    const income = monthlyIncomeOf(draft)
    if (income <= 0) return null
    return computeEligibility({
      monthlyIncome: income,
      otherIncome: draft.otherIncome,
      existingMonthlyObligations: draft.existingMonthlyObligations,
      amount: config.minAmount,
      durationMonths: config.maxMonths,
      annualRate: config.annualRate,
    })
  }, [draft, config])

  const emi =
    amount > 0 && duration > 0 ? monthlyPayment(amount, config.annualRate, duration) : null

  const submit = handleSubmit((values) => {
    const merged = { ...draft, ...values } as ApplicationDraft
    const issues = validateCrossStep(merged)
    if (issues.length > 0) {
      setCrossError(null)
      for (const issue of issues) {
        setError(issue.field, { type: 'manual', message: issue.message })
      }
      return
    }
    update(values as Partial<ApplicationDraft>)
    onContinue()
  })

  const minDown = (propertyPrice ?? 0) * 0.1

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-2xl font-bold tracking-tight">Détails du prêt</h2>
      <p className="text-mist mt-2 text-sm">
        {config.label} — de {config.minAmount.toLocaleString('fr-TN')} à{' '}
        {config.maxAmount.toLocaleString('fr-TN')} TND sur {config.minMonths} à {config.maxMonths} mois.
      </p>

      {capacity && (
        <div className="bg-primary-soft border-primary/20 mt-5 rounded-2xl border p-4 text-sm">
          <span className="font-semibold">Capacité estimée :</span>{' '}
          <span className="text-primary font-bold">
            ≈ {Math.floor(capacity.maxEligibleAmount / 100) * 100 >= 1000
              ? (Math.floor(capacity.maxEligibleAmount / 100) * 100).toLocaleString('fr-TN')
              : Math.floor(capacity.maxEligibleAmount).toLocaleString('fr-TN')}{' '}
            TND
          </span>{' '}
          <span className="text-mist">
            (règle des 40 % appliquée à vos revenus déclarés)
          </span>
        </div>
      )}

      <div className="mt-8 space-y-6">
        <NumberField
          label="Montant souhaité"
          registration={register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
        />
        <input
          type="range"
          aria-label="Montant souhaité (curseur)"
          min={config.minAmount}
          max={config.maxAmount}
          step={500}
          value={Number.isFinite(amount) && amount > 0 ? amount : config.minAmount}
          onChange={(e) => setValue('amount', Number(e.target.value), { shouldValidate: false })}
          className="accent-primary w-full"
        />

        <NumberField
          label="Durée (mois)"
          currency={null}
          registration={register('durationMonths', { valueAsNumber: true })}
          error={errors.durationMonths?.message}
        />
        <input
          type="range"
          aria-label="Durée en mois (curseur)"
          min={config.minMonths}
          max={config.maxMonths}
          step={6}
          value={Number.isFinite(duration) && duration > 0 ? duration : config.minMonths}
          onChange={(e) => setValue('durationMonths', Number(e.target.value), { shouldValidate: false })}
          className="accent-primary w-full"
        />

        {emi !== null && Number.isFinite(emi) && (
          <div className="border-line rounded-2xl border border-dashed p-4 text-center">
            <p className="text-mist text-xs font-semibold tracking-wider uppercase">
              Mensualité estimée
            </p>
            <p className="font-display text-primary mt-1 text-3xl font-extrabold">
              {Math.round(emi).toLocaleString('fr-TN')}{' '}
              <span className="text-gold text-lg">TND / mois</span>
            </p>
            <p className="text-mist mt-1 text-xs">
              Taux annuel {(config.annualRate * 100).toFixed(1)} % — hors assurance
            </p>
          </div>
        )}

        {draft.loanType === 'home' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              label="Prix du bien"
              registration={register('propertyPrice', { valueAsNumber: true })}
              error={errors.propertyPrice?.message}
            />
            <NumberField
              label="Apport personnel"
              hint={
                minDown > 0
                  ? `Minimum : ${Math.round(minDown).toLocaleString('fr-TN')} TND (10 % du prix)`
                  : undefined
              }
              registration={register('downPayment', { valueAsNumber: true })}
              error={errors.downPayment?.message}
            />
          </div>
        )}

        {draft.loanType === 'personal' && (
          <SelectField
            label="Motif du crédit"
            registration={register('loanPurpose')}
            error={errors.loanPurpose?.message}
            options={[{ value: '', label: '— Sélectionner —' }, ...PERSONAL_PURPOSES]}
          />
        )}

        {draft.loanType === 'business' && (
          <SelectField
            label="Objet du financement"
            registration={register('loanPurpose')}
            error={errors.loanPurpose?.message}
            options={[{ value: '', label: '— Sélectionner —' }, ...BUSINESS_PURPOSES]}
          />
        )}
      </div>

      {crossError && (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {crossError}
        </p>
      )}

      <div className="mt-10 flex justify-end">
        <button
          type="submit"
          className="bg-primary hover:bg-primary-deep rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors"
        >
          Continuer
        </button>
      </div>
    </form>
  )
}
