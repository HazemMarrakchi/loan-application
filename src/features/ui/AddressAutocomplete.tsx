import { useEffect, useRef, useState } from 'react'
import { searchPlaces, type PlaceEntry } from '../../data/tunisia'

interface AddressAutocompleteProps {
  label?: string
  error?: string
  onSelect: (place: PlaceEntry) => void
}

export default function AddressAutocomplete({ label = 'Localité', error, onSelect }: AddressAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceEntry[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      const found = searchPlaces(query)
      setResults(found)
      setOpen(found.length > 0)
      setActiveIndex(-1)
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  function choose(place: PlaceEntry) {
    onSelect(place)
    setQuery(`${place.delegation} — ${place.governorate}`)
    setOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open || results.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      choose(results[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <label htmlFor="locality-search" className="mb-1.5 block text-xs font-semibold tracking-wide">
        {label}
      </label>
      <input
        id="locality-search"
        role="combobox"
        aria-expanded={open}
        aria-controls="locality-listbox"
        autoComplete="off"
        placeholder="Ex : Gabès Médina, La Marsa, 1004…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => {
          closeTimer.current = setTimeout(() => setOpen(false), 150)
        }}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-mist/60 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? 'border-red-400' : 'border-line'
        }`}
      />
      {open && (
        <ul
          id="locality-listbox"
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {results.map((place, index) => (
            <li key={`${place.postalCode}-${place.delegation}`} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(place)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                  index === activeIndex ? 'bg-primary-soft' : ''
                }`}
              >
                <span className="font-medium">
                  {place.delegation}
                  <span className="text-mist font-normal"> — {place.governorate}</span>
                </span>
                <span className="font-mono text-xs">{place.postalCode}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
