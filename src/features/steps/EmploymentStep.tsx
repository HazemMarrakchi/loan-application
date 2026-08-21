import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { employmentStepSchema } from '../../core/validation/schemas'
import type { ApplicationDraft, EmploymentStatus } from '../../core/types'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'
import { NumberField, TextField } from '../ui/fields'

type EmploymentValues = z.input<typeof employmentStepSchema>

const STATUS_CARDS: { value: EmploymentStatus; label: string; description: string; icon: string }[] = [
  { value: 'salaried', label: 'Salarié(e)', description: 'CDI, CDD ou SIVP', icon: '💼' },
  { value: 'self_employed', label: 'Indépendant(e)', description: 'Entreprise, profession libérale', icon: '🏢' },
  { value: 'retired', label: 'Retraité(e)', description: 'Pension CNRPS / Caisse nationale', icon: '🌴' },
]

export default function EmploymentStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()

  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<EmploymentValues>({
    resolver: zodResolver(employmentStepSchema),
    mode: 'onTouched',
    shouldUnregister: true,
    defaultValues: {
      employmentStatus: draft.employmentStatus,
      employerName: draft.employerName ?? '',
      cnssNumber: draft.cnssNumber ?? '',
      jobTitle: draft.jobTitle ?? '',
      hireDate: draft.hireDate ?? '',
      monthlySalary: draft.monthlySalary,
      otherIncome: draft.otherIncome,
      existingMonthlyObligations: draft.existingMonthlyObligations,
      businessName: draft.businessName ?? '',
      matriculeFiscal: draft.matriculeFiscal ?? '',
      annualRevenue: draft.annualRevenue,
      yearsInBusiness: draft.yearsInBusiness,
    },
  })

  const status = watch('employmentStatus')

  useEffect(() => {
    const subscription = watch((values) => update(values as Partial<ApplicationDraft>))
    return () => subscription.unsubscribe()
  }, [watch, update])

  const submit = handleSubmit((values) => {
    update(values as Partial<ApplicationDraft>)
    onContinue()
  })

  function changeStatus(next: EmploymentStatus) {
    setValue('employmentStatus', next, { shouldDirty: true })
    clearErrors()
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-2xl font-bold tracking-tight">Situation professionnelle</h2>
      <p className="text-mist mt-2 text-sm">
        Vos revenus déterminent votre capacité de remboursement (règle des 40 %).
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Statut professionnel">
        {STATUS_CARDS.map((card) => (
          <button
            key={card.value}
            type="button"
            role="radio"
            aria-checked={status === card.value}
            onClick={() => changeStatus(card.value)}
            className={`rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
              status === card.value
                ? 'border-primary bg-primary-soft ring-primary/30 ring-2'
                : 'border-line bg-white hover:border-primary/40'
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {card.icon}
            </span>
            <p className={`mt-1 text-sm font-bold ${status === card.value ? 'text-primary' : ''}`}>
              {card.label}
            </p>
            <p className="text-mist mt-0.5 text-xs">{card.description}</p>
          </button>
        ))}
      </div>

      <input type="hidden" {...register('employmentStatus')} />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {status === 'salaried' && (
          <>
            <TextField
              label="Employeur"
              placeholder="STEG, BIAT, Digilife…"
              registration={register('employerName')}
              error={errors.employerName?.message}
            />
            <TextField
              label="N° CNSS"
              placeholder="12345678"
              inputMode="numeric"
              registration={register('cnssNumber')}
              error={errors.cnssNumber?.message}
            />
            <TextField
              label="Poste occupé (optionnel)"
              placeholder="Ingénieur logiciel"
              registration={register('jobTitle')}
              error={errors.jobTitle?.message}
            />
            <TextField
              label="Date d’embauche (optionnel)"
              type="date"
              registration={register('hireDate')}
              error={errors.hireDate?.message}
            />
            <NumberField
              label="Salaire net mensuel"
              registration={register('monthlySalary', { valueAsNumber: true })}
              error={errors.monthlySalary?.message}
            />
          </>
        )}

        {status === 'self_employed' && (
          <>
            <TextField
              label="Nom de l’entreprise"
              placeholder="Marrakchi Services SARL"
              registration={register('businessName')}
              error={errors.businessName?.message}
            />
            <TextField
              label="Matricule fiscal"
              placeholder="1234567/A/M/000"
              registration={register('matriculeFiscal')}
              error={errors.matriculeFiscal?.message}
            />
            <NumberField
              label="Chiffre d’affaires annuel"
              registration={register('annualRevenue', { valueAsNumber: true })}
              error={errors.annualRevenue?.message}
            />
            <NumberField
              label="Années d’activité"
              currency={null}
              registration={register('yearsInBusiness', { valueAsNumber: true })}
              error={errors.yearsInBusiness?.message}
            />
          </>
        )}

        {status === 'retired' && (
          <NumberField
            label="Pension mensuelle nette"
            registration={register('monthlySalary', { valueAsNumber: true })}
            error={errors.monthlySalary?.message}
          />
        )}

        <NumberField
          label="Autres revenus mensuels"
          hint="Loyers, rentes… (0 si aucun)"
          registration={register('otherIncome', { valueAsNumber: true })}
          error={errors.otherIncome?.message}
        />
        <NumberField
          label="Échéances de crédits en cours"
          hint="Total mensuel de vos dettes actuelles"
          registration={register('existingMonthlyObligations', { valueAsNumber: true })}
          error={errors.existingMonthlyObligations?.message}
        />
      </div>

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
