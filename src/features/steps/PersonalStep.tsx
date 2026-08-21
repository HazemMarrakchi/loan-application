import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { personalStepSchema } from '../../core/validation/schemas'
import type { ApplicationDraft } from '../../core/types'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'
import { SelectField, TextField } from '../ui/fields'

type PersonalValues = z.infer<typeof personalStepSchema>

const MARITAL_OPTIONS = [
  { value: 'single', label: 'Célibataire' },
  { value: 'married', label: 'Marié(e)' },
  { value: 'divorced', label: 'Divorcé(e)' },
  { value: 'widowed', label: 'Veuf / Veuve' },
]

export default function PersonalStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalValues>({
    resolver: zodResolver(personalStepSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: draft.firstName,
      lastName: draft.lastName,
      birthDate: draft.birthDate,
      nationalId: draft.nationalId,
      maritalStatus: draft.maritalStatus,
      dependents: draft.dependents,
    },
  })

  const submit = handleSubmit((values) => {
    update(values as Partial<ApplicationDraft>)
    onContinue()
  })

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-2xl font-bold tracking-tight">Informations personnelles</h2>
      <p className="text-mist mt-2 text-sm">Conforme à votre CIN — vérifiée à l’étape KYC.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <TextField
          label="Prénom"
          placeholder="Hazem"
          autoComplete="given-name"
          registration={register('firstName')}
          error={errors.firstName?.message}
        />
        <TextField
          label="Nom"
          placeholder="Marrakchi"
          autoComplete="family-name"
          registration={register('lastName')}
          error={errors.lastName?.message}
        />
        <TextField
          label="Date de naissance"
          type="date"
          registration={register('birthDate')}
          error={errors.birthDate?.message}
        />
        <TextField
          label="N° CIN"
          placeholder="01234567"
          inputMode="numeric"
          maxLength={8}
          registration={register('nationalId')}
          error={errors.nationalId?.message}
          hint="8 chiffres, comme sur votre carte d’identité"
        />
        <SelectField
          label="Situation familiale"
          registration={register('maritalStatus')}
          error={errors.maritalStatus?.message}
          options={MARITAL_OPTIONS}
        />
        <TextField
          label="Personnes à charge"
          type="number"
          min={0}
          max={15}
          registration={register('dependents', { valueAsNumber: true })}
          error={errors.dependents?.message}
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
