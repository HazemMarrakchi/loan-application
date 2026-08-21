import { useCallback, useReducer } from 'react'

interface WizardState {
  index: number
  maxVisited: number
}

type WizardAction =
  | { type: 'goto'; index: number }
  | { type: 'jump'; index: number }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'reset' }

function createReducer(totalSteps: number) {
  return (state: WizardState, action: WizardAction): WizardState => {
    switch (action.type) {
      case 'goto': {
        if (action.index < 0 || action.index > state.maxVisited) return state
        return { ...state, index: action.index }
      }
      case 'jump': {
        const index = Math.min(Math.max(action.index, 0), totalSteps - 1)
        return { index, maxVisited: Math.max(state.maxVisited, index) }
      }
      case 'next': {
        const next = Math.min(state.index + 1, totalSteps - 1)
        return {
          index: next,
          maxVisited: Math.max(state.maxVisited, next),
        }
      }
      case 'back':
        return { ...state, index: Math.max(0, state.index - 1) }
      case 'reset':
        return { index: 0, maxVisited: 0 }
    }
  }
}

export function useWizardState(totalSteps: number) {
  const [state, dispatch] = useReducer(createReducer(totalSteps), { index: 0, maxVisited: 0 })

  const goto = useCallback((index: number) => dispatch({ type: 'goto', index }), [])
  const jump = useCallback((index: number) => dispatch({ type: 'jump', index }), [])
  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const back = useCallback(() => dispatch({ type: 'back' }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])

  return { ...state, goto, jump, next, back, reset }
}
