import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

const baseControl =
  'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-mist/60 focus:border-primary focus:ring-2 focus:ring-primary/20'
const borderOk = 'border-line'
const borderError = 'border-red-400 focus:border-red-500 focus:ring-red-100'

function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold tracking-wide">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-mist mt-1.5 text-xs">{hint}</p>
      ) : null}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  hint?: string
}

export function TextField({ label, registration, error, hint, ...input }: TextFieldProps) {
  return (
    <FieldShell label={label} htmlFor={registration.name} error={error} hint={hint}>
      <input
        id={registration.name}
        aria-invalid={!!error}
        className={`${baseControl} ${error ? borderError : borderOk}`}
        {...input}
        {...registration}
      />
    </FieldShell>
  )
}

export function NumberField({
  label,
  registration,
  error,
  hint,
  currency = 'TND',
  ...input
}: TextFieldProps & { currency?: string | null }) {
  const control = (
    <div className="relative">
      <input
        id={registration.name}
        type="number"
        inputMode="decimal"
        aria-invalid={!!error}
        className={`${baseControl} ${error ? borderError : borderOk} ${currency ? 'pr-14' : ''}`}
        {...input}
        {...registration}
      />
      {currency && (
        <span className="text-mist absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold">
          {currency}
        </span>
      )}
    </div>
  )
  return (
    <FieldShell label={label} htmlFor={registration.name} error={error} hint={hint}>
      {control}
    </FieldShell>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export function SelectField({ label, registration, error, hint, options, ...select }: SelectFieldProps) {
  return (
    <FieldShell label={label} htmlFor={registration.name} error={error} hint={hint}>
      <select
        id={registration.name}
        aria-invalid={!!error}
        className={`${baseControl} ${error ? borderError : borderOk} appearance-none`}
        {...select}
        {...registration}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
