import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ApplicationDraft } from '../../core/types'
import { createEmptyDraft } from './draftFactory'

interface DraftContextValue {
  draft: ApplicationDraft
  update: (patch: Partial<ApplicationDraft>) => void
  replace: (draft: ApplicationDraft) => void
  reset: () => void
}

const DraftContext = createContext<DraftContextValue | null>(null)

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ApplicationDraft>(createEmptyDraft)

  const update = useCallback((patch: Partial<ApplicationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
  }, [])

  const replace = useCallback((next: ApplicationDraft) => {
    setDraft(next)
  }, [])

  const reset = useCallback(() => {
    setDraft(createEmptyDraft())
  }, [])

  const value = useMemo(() => ({ draft, update, replace, reset }), [draft, update, replace, reset])

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext)
  if (!ctx) throw new Error('useDraft must be used within DraftProvider')
  return ctx
}
