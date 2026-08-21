import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { contactStepSchema } from '../../core/validation/schemas'
import type { ApplicationDraft } from '../../core/types'
import type { PlaceEntry } from '../../data/tunisia'
import { GOVERNORATES } from '../../data/tunisia'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'
import { TextField } from '../ui/fields'
import AddressAutocomplete from '../ui/AddressAutocomplete'

type ContactValues = z.infer<typeof contactStepSchema>

export default function ContactStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactStepSchema),
    mode: 'onTouched',
    defaultValues: {
      email: draft.email,
      phone: draft.phone,
      address: draft.address,
    },
  })

  useEffect(() => {
    const subscription = watch((values) => update(values as Partial<ApplicationDraft>))
    return () => subscription.unsubscribe()
  }, [watch, update])

  const submit = handleSubmit((values) => {
    update(values as Partial<ApplicationDraft>)
    onContinue()
  })

  function handlePlaceSelect(place: PlaceEntry) {
    setValue('address.city', place.delegation, { shouldValidate: true })
    setValue('address.governorate', place.governorate, { shouldValidate: true })
    setValue('address.postalCode', place.postalCode, { shouldValidate: true })
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-2xl font-bold tracking-tight">Adresse & contact</h2>
      <p className="text-mist mt-2 text-sm">
        Utilisez la recherche de localité pour remplir délégation, gouvernorat et code postal.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <TextField
          label="E-mail"
          type="email"
          placeholder="vous@exemple.tn"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />
        <TextField
          label="Téléphone"
          placeholder="22 907 082"
          inputMode="tel"
          autoComplete="tel"
          registration={register('phone')}
          error={errors.phone?.message}
          hint="+216 optionnel — mobile ou fixe"
        />

        <div className="sm:col-span-2">
          <AddressAutocomplete
            label="Recherche de localité"
            error={errors.address?.city?.message ?? errors.address?.governorate?.message}
            onSelect={handlePlaceSelect}
          />
        </div>

        <div className="sm:col-span-2">
          <TextField
            label="Adresse (rue, immeuble…)"
            placeholder="12 rue Farhat Hached, Apt 3"
            autoComplete="street-address"
            registration={register('address.street')}
            error={errors.address?.street?.message}
          />
        </div>
        <TextField
          label="Délégation"
          registration={register('address.city')}
          error={errors.address?.city?.message}
        />
        <div>
          <label htmlFor="address.governorate" className="mb-1.5 block text-xs font-semibold tracking-wide">
            Gouvernorat
          </label>
          <select
            id="address.governorate"
            aria-invalid={!!errors.address?.governorate}
            className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.address?.governorate ? 'border-red-400' : 'border-line'
            }`}
            {...register('address.governorate')}
          >
            <option value="">— Sélectionner —</option>
            {GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
          {errors.address?.governorate && (
            <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
              {errors.address.governorate.message}
            </p>
          )}
        </div>
        <TextField
          label="Code postal"
          inputMode="numeric"
          maxLength={4}
          placeholder="6000"
          registration={register('address.postalCode')}
          error={errors.address?.postalCode?.message}
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
