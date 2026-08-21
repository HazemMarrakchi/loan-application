import { useState } from 'react'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'
import SignaturePad from '../ui/SignaturePad'

export default function SignatureStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()
  const [signedDataUrl, setSignedDataUrl] = useState<string | null>(draft.signatureDataUrl ?? null)

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Signature électronique</h2>
      <p className="text-mist mt-2 text-sm">
        Signez pour certifier l’exactitude des informations fournies.
      </p>

      <div className="mt-8">
        <SignaturePad
          onChange={setSignedDataUrl}
          initialDataUrl={draft.signatureDataUrl}
        />
      </div>

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={() => {
            update({ signatureDataUrl: signedDataUrl ?? undefined })
            onContinue()
          }}
          disabled={!signedDataUrl}
          className="bg-primary hover:bg-primary-deep disabled:bg-line disabled:text-mist rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
        >
          Confirmer la signature
        </button>
      </div>
    </div>
  )
}
