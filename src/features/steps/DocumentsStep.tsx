import { useCallback, useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { LOAN_TYPES } from '../../data/loanTypes'
import type { DocumentKind, StoredDocument } from '../../core/types'
import { useDraft } from '../wizard/DraftContext'
import type { StepProps } from '../wizard/steps'
import { logger } from '../../core/logger'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_ORIGINAL_MB = 10
const MAX_DATA_URL_BYTES = 900_000

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.35,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1000))} KB`
}

interface DocSlotProps {
  kind: DocumentKind
  label: string
  doc: StoredDocument | undefined
  busy: boolean
  onFile: (kind: DocumentKind, file: File) => void
  onRemove: (id: string) => void
}

function DocSlot({ kind, label, doc, busy, onFile, onRemove }: DocSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const isPdf = doc?.fileName.toLowerCase().endsWith('.pdf')

  return (
    <div
      data-testid={`slot-${kind}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) onFile(kind, file)
      }}
      className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${
        dragOver ? 'border-primary bg-primary-soft' : doc ? 'border-solid border-line bg-white' : 'border-line bg-surface'
      }`}
    >
      <p className="text-xs font-bold tracking-wide">{label}</p>

      {!doc && !busy && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-mist hover:text-primary mt-3 flex w-full flex-col items-center gap-1 rounded-xl py-4 text-xs font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
          </svg>
          Glissez un fichier ou cliquez
          <span className="text-mist/70">JPG, PNG, WebP ou PDF · max {MAX_ORIGINAL_MB} Mo</span>
        </button>
      )}

      {busy && (
        <div className="mt-3 flex items-center justify-center gap-2 py-4 text-xs font-medium">
          <span className="border-primary border-t-primary h-4 w-4 animate-spin rounded-full border-2" aria-hidden="true" />
          Compression en cours…
        </div>
      )}

      {doc && !busy && (
        <div className="mt-3 flex items-center gap-3">
          {isPdf ? (
            <div className="flex h-16 w-14 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-600">
              PDF
            </div>
          ) : (
            <img
              src={doc.dataUrl}
              alt={`Aperçu ${label}`}
              className="border-line h-16 w-14 rounded-lg border object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{doc.fileName}</p>
            <p className="text-mist mt-0.5 text-[11px]">
              {formatBytes(doc.originalSizeBytes)} →{' '}
              <span className="text-primary font-bold">{formatBytes(doc.compressedSizeBytes)}</span>
              {doc.originalSizeBytes > doc.compressedSizeBytes && (
                <span className="text-primary">
                  {' '}
                  (−{Math.round((1 - doc.compressedSizeBytes / doc.originalSizeBytes) * 100)} %)
                </span>
              )}
            </p>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-primary text-[11px] font-semibold hover:underline"
              >
                Remplacer
              </button>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                className="text-[11px] font-semibold text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(kind, file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function DocumentsStep({ onContinue }: StepProps) {
  const { draft, update } = useDraft()
  const config = LOAN_TYPES[draft.loanType]
  const [busyKind, setBusyKind] = useState<DocumentKind | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (kind: DocumentKind, file: File) => {
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Format non supporté. Utilisez JPG, PNG, WebP ou PDF.')
        return
      }
      if (file.size > MAX_ORIGINAL_MB * 1_000_000) {
        setError(`Fichier trop volumineux (max ${MAX_ORIGINAL_MB} Mo).`)
        return
      }

      setBusyKind(kind)
      try {
        let outputBlob: Blob = file
        if (file.type !== 'application/pdf') {
          outputBlob = await imageCompression(file, COMPRESSION_OPTIONS)
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('read failed'))
          reader.readAsDataURL(outputBlob)
        })

        if (dataUrl.length > MAX_DATA_URL_BYTES) {
          setError('Le fichier reste trop volumineux après compression. Réduisez sa résolution.')
          return
        }

        const stored: StoredDocument = {
          id: crypto.randomUUID(),
          kind,
          fileName: file.name,
          originalSizeBytes: file.size,
          compressedSizeBytes: dataUrl.length,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        }

        const others = draft.documents.filter((d) => d.kind !== kind)
        update({ documents: [...others, stored] })
        logger.info('document stored', { kind, original: file.size, final: dataUrl.length })
      } catch (err) {
        logger.error('document processing failed', { kind, err: String(err) })
        setError('Échec du traitement du fichier. Réessayez.')
      } finally {
        setBusyKind(null)
      }
    },
    [draft.documents, update],
  )

  function handleRemove(id: string) {
    update({ documents: draft.documents.filter((d) => d.id !== id) })
  }

  const providedKinds = new Set(draft.documents.map((d) => d.kind))
  const missing = config.requiredDocuments.filter((k) => !providedKinds.has(k))
  const complete = missing.length === 0

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Documents justificatifs</h2>
      <p className="text-mist mt-2 text-sm">
        Les images sont compressées automatiquement sur votre appareil avant envoi.
      </p>

      <p className="mt-4 text-sm font-semibold" aria-live="polite">
        {config.requiredDocuments.length - missing.length}/{config.requiredDocuments.length} pièces fournies
        {complete ? ' — complet ✓' : ''}
      </p>

      {error && (
        <p className="bg-red-50 border-red-200 mt-4 rounded-xl border p-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {config.requiredDocuments.map((kind) => (
          <DocSlot
            key={kind}
            kind={kind}
            label={config.documentLabels[kind] ?? kind}
            doc={draft.documents.find((d) => d.kind === kind)}
            busy={busyKind === kind}
            onFile={handleFile}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          disabled={!complete}
          className="bg-primary hover:bg-primary-deep disabled:bg-line disabled:text-mist rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
