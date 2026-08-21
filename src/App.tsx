import WizardShell from './features/wizard/WizardShell'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-line border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#0B6B4F" />
              <path
                d="M16 6 L24 13 L16 26 L8 13 Z"
                fill="none"
                stroke="#C9A227"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="14" r="3" fill="#C9A227" />
            </svg>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">Dhahabi</p>
              <p className="text-mist text-xs font-medium">Plateforme de demande de crédit</p>
            </div>
          </div>
          <span className="bg-gold-soft text-ink rounded-full px-3 py-1 text-xs font-semibold">
            M2 · Wizard opérationnel
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Tunisie · Dinar (TND)
          </p>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Votre demande de crédit en 9 étapes
          </h1>
          <p className="text-mist mt-3 max-w-xl text-sm leading-relaxed">
            Validation temps réel, pièces justificatives, signature électronique et
            pré-approbation instantanée. Votre brouillon est sauvegardé automatiquement.
          </p>
        </div>

        <WizardShell />
      </main>

      <footer className="border-line mt-12 border-t py-6 text-center">
        <p className="text-mist text-xs">
          © {new Date().getFullYear()} Dhahabi · React 19 · Vite · Tailwind v4
        </p>
      </footer>
    </div>
  )
}
