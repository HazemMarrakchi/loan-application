import { LOAN_TYPE_ORDER, LOAN_TYPES } from '../../data/loanTypes'
import type { LoanType } from '../../core/types'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'

export default function LoanTypeStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()
  const selected: LoanType | null = draft.amount > 0 || draft.loanType ? draft.loanType : null

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Quel projet finançons-nous ?</h2>
      <p className="text-mist mt-2 text-sm">
        Les étapes suivantes et les pièces justificatives s’adapteront à votre choix.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Type de prêt">
        {LOAN_TYPE_ORDER.map((type) => {
          const config = LOAN_TYPES[type]
          const active = selected === type
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => update({ loanType: type })}
              className={`rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                active
                  ? 'border-primary bg-primary-soft shadow-card ring-primary/30 ring-2'
                  : 'border-line bg-white hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-display font-bold ${active ? 'text-primary' : ''}`}>
                  {config.label}
                </span>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    active ? 'border-primary bg-primary' : 'border-line'
                  }`}
                />
              </div>
              <p className="text-mist mt-2 text-xs leading-relaxed">{config.description}</p>
              <dl className="mt-4 space-y-1 border-t border-line pt-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-mist">Montant</dt>
                  <dd className="font-semibold">
                    {config.minAmount.toLocaleString('fr-TN')}–{config.maxAmount.toLocaleString('fr-TN')} TND
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Durée</dt>
                  <dd className="font-semibold">
                    {config.minMonths}–{config.maxMonths} mois
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Taux annuel</dt>
                  <dd className="text-gold font-bold">{(config.annualRate * 100).toFixed(1)} %</dd>
                </div>
              </dl>
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selected}
          className="bg-primary hover:bg-primary-deep disabled:bg-line disabled:text-mist rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
