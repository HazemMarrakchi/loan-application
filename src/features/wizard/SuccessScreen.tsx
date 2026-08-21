import { useMemo } from 'react'

interface SuccessScreenProps {
  onRestart: () => void
}

export default function SuccessScreen({ onRestart }: SuccessScreenProps) {
  const reference = useMemo(
    () => `DHB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    [],
  )

  return (
    <div className="py-10 text-center" data-testid="success-screen">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-10 w-10 text-green-700" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight">Demande soumise !</h2>
      <p className="text-mist mx-auto mt-3 max-w-md text-sm leading-relaxed">
        Votre dossier a été transmis à notre comité de crédit. Vous recevrez une réponse
        sous 48 heures ouvrées à votre adresse e-mail.
      </p>
      <p className="mt-6 text-xs font-semibold tracking-wider uppercase">Référence de suivi</p>
      <p className="font-display text-gold mt-1 text-2xl font-extrabold tracking-wide">{reference}</p>

      <button
        type="button"
        onClick={onRestart}
        className="border-line hover:border-primary hover:text-primary mt-10 rounded-full border px-8 py-3 text-sm font-semibold transition-colors"
      >
        Nouvelle demande
      </button>
    </div>
  )
}
