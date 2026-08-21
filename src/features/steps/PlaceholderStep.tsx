import type { StepProps } from '../wizard/steps'

interface PlaceholderStepProps extends StepProps {
  title?: string
  milestone?: number
}

export default function PlaceholderStep({ onContinue, title, milestone }: PlaceholderStepProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">{title ?? 'Étape à venir'}</h2>
      <p className="text-mist mt-3 text-sm">
        Cette étape sera implémentée au jalon M{milestone ?? '—'}.
      </p>
      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="bg-primary hover:bg-primary-deep rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
