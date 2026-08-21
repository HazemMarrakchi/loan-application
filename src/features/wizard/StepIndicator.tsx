interface StepIndicatorProps {
  labels: string[]
  current: number
  maxVisited: number
  onStepClick: (index: number) => void
}

export default function StepIndicator({ labels, current, maxVisited, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progression de la demande">
      <ol className="flex items-start">
        {labels.map((label, index) => {
          const done = index < current
          const isCurrent = index === current
          const reachable = index <= maxVisited
          const isLast = index === labels.length - 1

          return (
            <li key={label} className={`flex ${isLast ? '' : 'flex-1'} items-start`}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!reachable || isCurrent}
                  onClick={() => onStepClick(index)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Étape ${index + 1} : ${label}`}
                  className={`font-display flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    done
                      ? 'border-primary bg-primary text-white'
                      : isCurrent
                        ? 'border-primary bg-white text-primary ring-gold/40 ring-4'
                        : 'border-line bg-white text-mist'
                  } ${reachable && !isCurrent ? 'hover:border-primary cursor-pointer' : 'cursor-default'}`}
                >
                  {done ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.79 6.8-6.8a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
                <span
                  className={`mt-2 w-24 text-center text-[11px] leading-tight font-medium ${
                    isCurrent ? 'text-ink' : 'text-mist'
                  } hidden sm:block`}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mt-[17px] h-0.5 flex-1 ltr:mr-2 rtl:ml-2 ${
                    index < current ? 'bg-primary' : 'bg-line'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
