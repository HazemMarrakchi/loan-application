# PROJECT MAP — Dhahabi (loan-application)

## Décisions d'architecture

1. **Schema-driven forms** : Zod discriminated unions sur `loanType` → champs/documents
   conditionnels pilotés par configuration (aucun `if (type === ...)` éparpillé dans l'UI).
2. **React Hook Form + Zod** : formulaires uncontrolled (perf), résolution par schéma,
   validation `onBlur` + `onChange`.
3. **Machine à états wizard** : 9 étapes, garde-fous de navigation (avancer = étape valide,
   retour libre), reprise depuis localStorage versionné.
4. **Services purs injectables** : KYC (simulation CIN/Matricule fiscal), autocomplete
   adresse (dataset Tunisie local, remplaçable par un provider distant), éligibilité
   (FOIR/DTI → montant approuvé + EMI estimée en TND).
5. **Auto-save** : debounce sur `watch()` → localStorage clé versionnée ; schéma incompatible
   = purge propre, jamais de crash.
6. **E2E Playwright** (M8) : 3 happy paths (un par type de prêt), parcours d'erreurs,
   scénario reprise après reload.

## Contexte métier — Tunisie 🇹🇳

- Devise : TND (dinar tunisien, 3 décimales — millimes)
- Identité : CIN (8 chiffres), Matricule fiscal (business)
- Emploi : n° CNSS pour salariés
- Adresses : gouvernorats / délégations / codes postaux (dataset local)
- Documents : CIN recto/verso, bulletin de paie, relevé bancaire, attestation travail ;
  business : patente, registre commerce (RNE), déclarations TVA

## Étapes du wizard (9)

1. Type de prêt (Personnel / Immobilier / Professionnel)
2. Informations personnelles
3. Adresse & contact (autocomplete)
4. Situation professionnelle (conditionnel salarié/indépendant)
5. Détails du prêt (champs divergents par type + validations croisées)
6. Documents justificatifs (compression client + preview)
7. Vérification KYC (CIN + Matricule fiscal simulés)
8. Signature électronique (canvas pointer events)
9. Récapitulatif & pré-approbation (moteur FOIR/DTI)

## Jalons

- [x] **M0** Scaffold + versions épinglées + build vert + design tokens
- [ ] **M1** Modèle domaine + schémas Zod (3 types) + moteur éligibilité
- [ ] **M2** Wizard shell : machine à états, progression, gardes, auto-save/reprise
- [ ] **M3** Étapes 1–4 + validation temps réel
- [ ] **M4** Champs conditionnels + validations croisées inter-étapes
- [ ] **M5** Documents : dropzone, compression, previews
- [ ] **M6** KYC simulé + pad de signature
- [ ] **M7** Récapitulatif + pré-approbation + soumission
- [ ] **M8** Suite E2E Playwright complète
- [ ] **M9** Polish a11y + audit prod + deploy Vercel

## Structure

```
src/
  core/logger.ts            # logger async-safe par niveaux
  styles/global.css         # tokens @theme Tailwind v4
  data/                     # (M1) config types de prêt, dataset adresses
  core/validation/          # (M1) schémas Zod + règles croisées
  core/services/            # (M1+) kyc, address, storage, eligibility
  features/wizard/          # (M2) shell, step indicator, guards
  features/steps/           # (M3+) un composant par étape
  features/ui/              # champs réutilisables, dropzone, signature
  hooks/                    # useAutoSave...
```

## [ORPHANS & PENDING]

- Repo GitHub + deploy Vercel à créer (fin M0)
- Provider autocomplete distant optionnel (Google Places) — abstraction prête, non branché
