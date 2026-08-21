import { useState } from 'react'
import { LOAN_TYPES } from '../../data/loanTypes'
import { monthlyIncomeOf } from '../../core/validation/crossStep'
import { computeEligibility } from '../../core/services/eligibility'
import { clearStoredDraft } from '../../core/services/storage'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'

interface SummaryStepProps extends StepProps {
  goto?: (index: number) => void
  onFinish?: () => void
}

function Section({
  title,
  stepIndex,
  goto,
  children,
}: {
  title: string
  stepIndex: number
  goto?: (i: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="border-line rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider uppercase">{title}</h3>
        {goto && (
          <button
            type="button"
            onClick={() => goto(stepIndex)}
            className="text-primary text-xs font-semibold hover:underline"
          >
            Modifier
          </button>
        )}
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">{children}</dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-mist">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  )
}

export default function SummaryStep({ goto, onFinish }: SummaryStepProps) {
  const { draft } = useDraft()
  const config = LOAN_TYPES[draft.loanType]
  const [submitting, setSubmitting] = useState(false)

  const income = monthlyIncomeOf(draft)
  const eligibility = computeEligibility({
    monthlyIncome: income,
    otherIncome: draft.otherIncome,
    existingMonthlyObligations: draft.existingMonthlyObligations,
    amount: draft.amount,
    durationMonths: draft.durationMonths,
    annualRate: config.annualRate,
  })

  async function submit() {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1600))
    clearStoredDraft()
    onFinish?.()
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Récapitulatif & pré-approbation</h2>
      <p className="text-mist mt-2 text-sm">Vérifiez l’ensemble avant signature finale du dossier.</p>

      <div
        className={`mt-6 rounded-2xl border p-5 ${
          eligibility.decision === 'approved'
            ? 'border-green-300 bg-green-50'
            : 'border-gold/40 bg-gold-soft'
        }`}
        data-testid="preapproval-panel"
      >
        {eligibility.decision === 'approved' ? (
          <>
            <p className="font-display text-lg font-extrabold text-green-800">
              ✓ Dossier pré-approuvé
            </p>
            <p className="mt-1 text-sm text-green-900">
              Mensualité de{' '}
              <strong>{Math.round(eligibility.requestedEmi).toLocaleString('fr-TN')} TND</strong> pendant{' '}
              {draft.durationMonths} mois — taux {(config.annualRate * 100).toFixed(1)} %.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-lg font-extrabold text-yellow-800">
              ⚠ Contre-offre proposée
            </p>
            <p className="mt-1 text-sm text-yellow-900">
              Sur la base de votre capacité, nous pouvons vous accorder{' '}
              <strong>{(eligibility.counterAmount ?? 0).toLocaleString('fr-TN')} TND</strong>.
            </p>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Section title="Prêt" stepIndex={0} goto={goto}>
          <Row label="Type" value={config.label} />
          <Row label="Montant" value={`${draft.amount.toLocaleString('fr-TN')} TND`} />
          <Row label="Durée" value={`${draft.durationMonths} mois`} />
          {draft.propertyPrice && <Row label="Prix du bien" value={`${draft.propertyPrice.toLocaleString('fr-TN')} TND`} />}
          {draft.downPayment !== undefined && draft.downPayment > 0 && (
            <Row label="Apport" value={`${draft.downPayment.toLocaleString('fr-TN')} TND`} />
          )}
        </Section>

        <Section title="Identité" stepIndex={1} goto={goto}>
          <Row label="Nom complet" value={`${draft.firstName} ${draft.lastName}`} />
          <Row label="CIN" value={<span className="font-mono">{draft.nationalId}</span>} />
          <Row label="Personnes à charge" value={draft.dependents} />
        </Section>

        <Section title="Contact" stepIndex={2} goto={goto}>
          <Row label="E-mail" value={draft.email} />
          <Row label="Téléphone" value={draft.phone} />
          <Row
            label="Adresse"
            value={`${draft.address.street}, ${draft.address.city} ${draft.address.postalCode}`}
          />
        </Section>

        <Section title="Situation professionnelle" stepIndex={3} goto={goto}>
          <Row
            label="Statut"
            value={
              draft.employmentStatus === 'salaried'
                ? 'Salarié(e)'
                : draft.employmentStatus === 'self_employed'
                  ? 'Indépendant(e)'
                  : 'Retraité(e)'
            }
          />
          {draft.employerName && <Row label="Employeur" value={draft.employerName} />}
          {draft.businessName && <Row label="Entreprise" value={draft.businessName} />}
          <Row label="Revenus mensuels" value={`${Math.round(income).toLocaleString('fr-TN')} TND`} />
        </Section>

        <Section title="Documents" stepIndex={5} goto={goto}>
          <Row label="Pièces fournies" value={`${draft.documents.length}`} />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {draft.documents.map((doc) => (
              <span key={doc.id} className="bg-primary-soft text-primary rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                {config.documentLabels[doc.kind]?.split('—')[0].trim() ?? doc.kind}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Signature" stepIndex={6} goto={goto}>
          {draft.signatureDataUrl ? (
            <img src={draft.signatureDataUrl} alt="Votre signature" className="border-line max-h-20 rounded-lg border" />
          ) : (
            <Row label="État" value="Non signée" />
          )}
        </Section>
      </div>

      <div className="mt-10 flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          data-testid="submit-application"
          className="from-primary to-gold shadow-primary/25 disabled:opacity-60 rounded-full bg-gradient-to-r px-9 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:hover:scale-100"
        >
          {submitting ? 'Envoi du dossier…' : 'Soumettre ma demande'}
        </button>
      </div>
    </div>
  )
}
