const STEPS = [
  'Type de prêt',
  'Informations personnelles',
  'Adresse & contact',
  'Situation professionnelle',
  'Détails du prêt',
  'Documents justificatifs',
  'Vérification KYC',
  'Signature électronique',
  'Récapitulatif & pré-approbation',
]

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
            M0 · Scaffold opérationnel
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-primary text-sm font-semibold tracking-wider uppercase">
          Tunisie · Dinar (TND)
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Votre crédit, <span className="text-primary">sans déplacement</span>.
        </h1>
        <p className="text-mist mt-5 max-w-xl text-lg leading-relaxed">
          Parcours de demande en 9 étapes : validation temps réel, pièces justificatives,
          signature électronique et pré-approbation instantanée.
        </p>

        <ol className="mt-12 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="border-line shadow-card rounded-xl border bg-white p-4 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="text-gold font-display text-sm font-bold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="mt-1 text-sm font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </main>

      <footer className="border-line mt-16 border-t py-6 text-center">
        <p className="text-mist text-xs">
          © {new Date().getFullYear()} Dhahabi · React 19 · Vite · Tailwind v4
        </p>
      </footer>
    </div>
  )
}
