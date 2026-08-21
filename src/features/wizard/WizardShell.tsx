import { useEffect, useRef, useState } from 'react'
import { clearStoredDraft, loadStoredDraft, saveStoredDraft, type StoredDraft } from '../../core/services/storage'
import { logger } from '../../core/logger'
import { isDraftEmpty } from './draftFactory'
import { DraftProvider, useDraft } from './DraftContext'
import { useWizardState } from './useWizardState'
import { STEPS } from './steps'
import StepIndicator from './StepIndicator'
import SuccessScreen from './SuccessScreen'

function WizardInner() {
  const { draft, replace, reset } = useDraft()
  const wizard = useWizardState(STEPS.length)
  const [submitted, setSubmitted] = useState(false)
  const [pendingResume, setPendingResume] = useState<StoredDraft | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const stored = loadStoredDraft()
    if (stored && (!isDraftEmpty(stored.draft) || stored.stepIndex > 0)) {
      setPendingResume(stored)
    }
  }, [])

  useEffect(() => {
    if (isDraftEmpty(draft) && wizard.index === 0) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const ok = saveStoredDraft(wizard.index, draft)
      if (ok) setLastSavedAt(new Date().toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' }))
      else logger.warn('autosave failed', { reason: 'storage unavailable' })
    }, 600)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [draft, wizard.index])

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDraftEmpty(draft)) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [draft])

  function acceptResume() {
    if (!pendingResume) return
    replace(pendingResume.draft)
    wizard.goto(Math.min(pendingResume.stepIndex, STEPS.length - 1))
    setPendingResume(null)
    logger.info('draft resumed', { stepIndex: pendingResume.stepIndex })
  }

  function declineResume() {
    clearStoredDraft()
    reset()
    wizard.reset()
    setPendingResume(null)
  }

  function handleContinue() {
    wizard.next()
    logger.info('step completed', { step: STEPS[wizard.index].id })
  }

  const progress = Math.round((wizard.index / (STEPS.length - 1)) * 100)

  if (submitted) {
    return (
      <div className="shadow-card rounded-3xl border border-line bg-white p-6 sm:p-10">
        <SuccessScreen
          onRestart={() => {
            clearStoredDraft()
            reset()
            wizard.reset()
            setSubmitted(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="shadow-card rounded-3xl border border-line bg-white p-6 sm:p-10">
      <StepIndicator
        labels={STEPS.map((s) => s.label)}
        current={wizard.index}
        maxVisited={wizard.maxVisited}
        onStepClick={wizard.goto}
      />

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div
          className="from-primary to-gold h-full rounded-full bg-gradient-to-r transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {pendingResume && (
        <div className="bg-gold-soft mt-6 flex flex-col gap-3 rounded-2xl border border-gold/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <span className="font-semibold">Brouillon trouvé</span>{' '}
            <span className="text-mist">
              — enregistré le{' '}
              {new Date(pendingResume.updatedAt).toLocaleString('fr-TN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={acceptResume}
              className="bg-primary hover:bg-primary-deep rounded-full px-5 py-2 text-xs font-semibold text-white"
            >
              Reprendre
            </button>
            <button
              type="button"
              onClick={declineResume}
              className="border-line hover:border-ink rounded-full border px-5 py-2 text-xs font-semibold"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 min-h-[280px]" key={STEPS[wizard.index].id}>
        {(() => {
          const StepComponent = STEPS[wizard.index].component
          return (
            <StepComponent
              onContinue={handleContinue}
              label={STEPS[wizard.index].label}
              milestone={STEPS[wizard.index].milestone}
              goto={wizard.goto}
              onFinish={() => setSubmitted(true)}
            />
          )
        })()}
      </div>

      <div className="border-line mt-8 flex items-center justify-between border-t pt-5">
        <button
          type="button"
          onClick={wizard.back}
          disabled={wizard.index === 0}
          className="border-line hover:border-ink disabled:opacity-40 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
        >
          Retour
        </button>
        <p className="text-mist text-xs" aria-live="polite">
          {lastSavedAt ? `Brouillon enregistré à ${lastSavedAt}` : 'Étape ' + (wizard.index + 1) + ' / ' + STEPS.length}
        </p>
      </div>
    </div>
  )
}

export default function WizardShell() {
  return (
    <DraftProvider>
      <WizardInner />
    </DraftProvider>
  )
}
