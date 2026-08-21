import type { ApplicationDraft } from '../types'

const STORAGE_KEY = 'dhahabi.draft'
export const SCHEMA_VERSION = 1

export interface StoredDraft {
  version: number
  stepIndex: number
  updatedAt: string
  draft: ApplicationDraft
}

export function loadStoredDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft
    if (parsed.version !== SCHEMA_VERSION || !parsed.draft || typeof parsed.stepIndex !== 'number') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveStoredDraft(stepIndex: number, draft: ApplicationDraft): boolean {
  const payload: StoredDraft = {
    version: SCHEMA_VERSION,
    stepIndex,
    updatedAt: new Date().toISOString(),
    draft,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

export function clearStoredDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
