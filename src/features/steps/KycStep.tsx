import { useState } from 'react'
import { verifyMatriculeFiscal, verifyNationalId, type KycOutcome } from '../../core/services/kycService'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'

type CheckState = 'idle' | 'running' | KycOutcome['status']

export default function KycStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()
  const [nationalIdCheck, setNationalIdCheck] = useState<CheckState>(draft.kycPassed ? 'verified' : 'idle')
  const [nationalIdMessage, setNationalIdMessage] = useState<string | null>(null)
  const [matriculeCheck, setMatriculeCheck] = useState<CheckState>('idle')
  const [matriculeMessage, setMatriculeMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const needsMatricule =
    draft.loanType === 'business' || draft.employmentStatus === 'self_employed'

  async function runVerification() {
    setRunning(true)
    setNationalIdCheck('running')
    setNationalIdMessage(null)
    if (needsMatricule) {
      setMatriculeCheck('running')
      setMatriculeMessage(null)
    }

    const cinResult = await verifyNationalId(draft.nationalId)
    setNationalIdCheck(cinResult.status)
    setNationalIdMessage(cinResult.message)

    let allPassed = cinResult.status === 'verified'

    if (needsMatricule && draft.matriculeFiscal) {
      const mfResult = await verifyMatriculeFiscal(draft.matriculeFiscal)
      setMatriculeCheck(mfResult.status)
      setMatriculeMessage(mfResult.message)
      allPassed = allPassed && mfResult.status === 'verified'
    }

    update({ kycPassed: allPassed })
    setRunning(false)
  }

  function badge(state: CheckState) {
    if (state === 'idle') return <span className="text-mist text-xs">En attente</span>
    if (state === 'running')
      return (
        <span className="text-gold inline-flex items-center gap-1.5 text-xs font-semibold">
          <span className="border-gold border-t-gold h-3 w-3 animate-spin rounded-full border-2" aria-hidden="true" />
          Vérification…
        </span>
      )
    if (state === 'verified') return <span className="text-xs font-bold text-green-700">✓ Vérifié</span>
    return <span className="text-xs font-bold text-red-600">✗ Rejeté</span>
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Vérification KYC</h2>
      <p className="text-mist mt-2 text-sm">
        Nous vérifions votre identité auprès des registres officiels (simulation).
      </p>

      <div className="mt-8 space-y-4">
        <div className="border-line flex items-center justify-between rounded-2xl border bg-white p-4">
          <div>
            <p className="text-mist text-xs font-semibold tracking-wide uppercase">Carte d’identité nationale</p>
            <p className="font-mono text-sm font-bold">{draft.nationalId}</p>
            {nationalIdMessage && nationalIdCheck !== 'running' && (
              <p className={`mt-1 text-xs ${nationalIdCheck === 'verified' ? 'text-green-700' : 'text-red-600'}`}>
                {nationalIdMessage}
              </p>
            )}
          </div>
          {badge(nationalIdCheck)}
        </div>

        {needsMatricule && (
          <div className="border-line flex items-center justify-between rounded-2xl border bg-white p-4">
            <div>
              <p className="text-mist text-xs font-semibold tracking-wide uppercase">Matricule fiscal</p>
              <p className="font-mono text-sm font-bold">{draft.matriculeFiscal}</p>
              {matriculeMessage && matriculeCheck !== 'running' && (
                <p className={`mt-1 text-xs ${matriculeCheck === 'verified' ? 'text-green-700' : 'text-red-600'}`}>
                  {matriculeMessage}
                </p>
              )}
            </div>
            {badge(matriculeCheck)}
          </div>
        )}
      </div>

      {!draft.kycPassed && (
        <button
          type="button"
          onClick={runVerification}
          disabled={running}
          className="bg-primary hover:bg-primary-deep mt-8 rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {running ? 'Vérification en cours…' : 'Lancer la vérification'}
        </button>
      )}

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          disabled={!draft.kycPassed}
          className="bg-primary hover:bg-primary-deep disabled:bg-line disabled:text-mist rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
