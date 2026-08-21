# Dhahabi — Plateforme de demande de crédit 🇹🇳

[![Démo live](https://img.shields.io/badge/%F0%9F%9A%80_D%C3%A9mo_live-hazemmarrakchi.github.io%2Floan--application-0B6B4F?style=for-the-badge)](https://hazemmarrakchi.github.io/loan-application/)

Parcours de demande de prêt en ligne **production-grade** : 9 étapes, validation temps réel,
champs conditionnels par type de crédit, documents compressés côté client, signature
électronique, auto-save avec reprise et pré-approbation instantanée.

## Stack

| Couche | Technologie |
|---|---|
| Build | Vite 8 · TypeScript 7 |
| UI | React 19 · Tailwind CSS v4 |
| Formulaires | React Hook Form 7 + Zod 4 (schémas divergents par type de prêt) |
| Documents | browser-image-compression (EXIF-safe, web worker) |
| E2E | Playwright |

## Démarrage

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # vérification TS + bundle production
npm run preview    # sert dist/ sur http://localhost:4173
npm run test:e2e   # suite Playwright (5 scénarios)
```

## Parcours (9 étapes)

1. **Type de prêt** — Personnel / Immobilier / Professionnel (plafonds & taux TND distincts)
2. **Informations personnelles** — CIN 8 chiffres, majorité 18–100 ans
3. **Adresse & contact** — autocomplete délégation/gouvernorat/code postal (dataset Tunisie)
4. **Situation professionnelle** — conditionnel : Salarié (CNSS) / Indépendant (matricule fiscal) / Retraité
5. **Détails du prêt** — sliders synchronisés, mensualité live, champs propres au type
6. **Documents** — glisser-déposer, compression automatique (~90 %), aperçus, exigences par type
7. **KYC simulé** — vérification CIN (+ matricule fiscal RNE si pro)
8. **Signature électronique** — canvas pointer events (souris/tactile/stylo), annuler/effacer
9. **Récapitulatif** — décision de pré-approbation (FOIR 40 %), contre-offre éventuelle, soumission

## Règles métier implémentées

- Capacité de remboursement : échéances totales ≤ 40 % des revenus (FOIR)
- Crédit immobilier : apport ≥ 10 % du prix, échéance avant 75 ans
- Crédit professionnel : montant ≤ 50 % du chiffre d'affaires annuel
- Contre-offre automatique quand le montant demandé dépasse la capacité

## Auto-save & reprise

Chaque frappe est persistée (debounce 600 ms) dans `localStorage` sous clé versionnée.
À la réouverture, une bannière propose de reprendre exactement là où vous vous êtes arrêté.

## Architecture

Voir [PROJECT_MAP.md](./PROJECT_MAP.md) — décisions, structure et jalons.
