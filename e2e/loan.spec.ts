import { expect, test, type Page } from '@playwright/test'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

const VALID = {
  firstName: 'Hazem',
  lastName: 'Ben Salah',
  birthDate: '1995-04-15',
  cin: '01234567',
  email: 'hazem.bensalah@example.tn',
  phone: '22907082',
  street: '12 rue Farhat Hached',
  city: 'Gabès Médina',
  governorate: 'Gabès',
  postalCode: '6000',
  salary: '2500',
}

async function startPersonalLoan(page: Page) {
  await page.goto('/')
  await page.getByRole('radio', { name: /Crédit Personnel/ }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
}

async function fillPersonalStep(page: Page) {
  await page.getByLabel('Prénom').fill(VALID.firstName)
  await page.getByLabel('Nom', { exact: true }).fill(VALID.lastName)
  await page.getByLabel('Date de naissance').fill(VALID.birthDate)
  await page.getByLabel('N° CIN').fill(VALID.cin)
  await page.getByLabel('Situation familiale').selectOption('married')
  await page.getByLabel('Personnes à charge').fill('2')
  await page.getByRole('button', { name: 'Continuer' }).click()
}

async function fillContactStep(page: Page) {
  await page.getByLabel('E-mail').fill(VALID.email)
  await page.getByLabel('Téléphone').fill(VALID.phone)
  await page.getByLabel('Adresse (rue, immeuble…)').fill(VALID.street)
  await page.getByLabel('Délégation').fill(VALID.city)
  await page.getByLabel('Gouvernorat').selectOption(VALID.governorate)
  await page.getByLabel('Code postal').fill(VALID.postalCode)
  await page.getByRole('button', { name: 'Continuer' }).click()
}

async function fillEmploymentSalaried(page: Page) {
  await page.getByRole('radio', { name: /Salarié/ }).click()
  await page.getByLabel('Employeur').fill('Digilife')
  await page.getByLabel('N° CNSS').fill('12345678')
  await page.getByLabel('Salaire net mensuel').fill(VALID.salary)
  await page.getByRole('button', { name: 'Continuer' }).click()
}

async function fillLoanDetails(page: Page, amount: string, months: string) {
  await page.getByLabel('Montant souhaité').fill(amount)
  await page.getByLabel('Durée (mois)').fill(months)
  await page.getByLabel('Motif du crédit').selectOption('treasury')
  await page.getByRole('button', { name: 'Continuer' }).click()
}

async function uploadAllDocuments(page: Page) {
  const docs = [
    { kind: 'cin_recto', label: 'CIN — recto' },
    { kind: 'cin_verso', label: 'CIN — verso' },
    { kind: 'payslip', label: 'Bulletin de paie (3 derniers mois)' },
    { kind: 'bank_statement', label: 'Relevé bancaire (3 derniers mois)' },
  ]
  for (const doc of docs) {
    const slot = page.getByTestId(`slot-${doc.kind}`)
    await slot.locator('input[type=file]').setInputFiles({
      name: 'justificatif.png',
      mimeType: 'image/png',
      buffer: TINY_PNG,
    })
    await expect(slot).toContainText('Remplacer')
  }
  await page.getByRole('button', { name: 'Continuer' }).click()
}

test.describe('Parcours de demande de crédit — Dhahabi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('1 · Validation temps réel : CIN invalide bloqué à l’étape 2', async ({ page }) => {
    await startPersonalLoan(page)
    await page.getByLabel('Prénom').fill('Ali')
    await page.getByLabel('Nom', { exact: true }).fill('Trabelsi')
    await page.getByLabel('Date de naissance').fill('1990-01-01')
    await page.getByLabel('N° CIN').fill('ABC123')
    await page.getByLabel('N° CIN').blur()
    await expect(page.getByText(/8 chiffres/)).toBeVisible()
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(page.getByRole('heading', { name: 'Informations personnelles' })).toBeVisible()
  })

  test('2 · Rendu conditionnel : le prêt professionnel exige un matricule fiscal', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('radio', { name: /Crédit Professionnel/ }).click()
    await page.getByRole('button', { name: 'Continuer' }).click()
    await fillPersonalStep(page)
    await fillContactStep(page)
    await page.getByRole('radio', { name: /Indépendant/ }).click()
    await expect(page.getByLabel('Matricule fiscal')).toBeVisible()
    await expect(page.getByLabel('Employeur')).toHaveCount(0)
  })

  test('3 · Dépendance inter-étapes : montant > capacité FOIR rejeté avec contre-offre', async ({ page }) => {
    await startPersonalLoan(page)
    await fillPersonalStep(page)
    await fillContactStep(page)
    await fillEmploymentSalaried(page)
    await fillLoanDetails(page, '60000', '12')
    await expect(page.getByText(/Montant éligible maximum|Capacité de remboursement insuffisante/)).toBeVisible()
  })

  test('4 · Auto-save & reprise : bannière après reload avec données restaurées', async ({ page }) => {
    await startPersonalLoan(page)
    await page.getByLabel('Prénom').fill('Mouna')
    await page.getByLabel('Prénom').blur()
    await page.waitForTimeout(1200)
    await page.reload()
    await expect(page.getByText('Brouillon trouvé')).toBeVisible()
    await page.getByRole('button', { name: 'Reprendre' }).click()
    await expect(page.getByLabel('Prénom')).toHaveValue('Mouna')
  })

  test('5 · Parcours complet Personnel : documents → KYC → signature → pré-approbation → succès', async ({ page }) => {
    await startPersonalLoan(page)
    await fillPersonalStep(page)
    await fillContactStep(page)
    await fillEmploymentSalaried(page)
    await fillLoanDetails(page, '20000', '48')

    await uploadAllDocuments(page)

    await page.getByRole('button', { name: 'Lancer la vérification' }).click()
    await expect(page.getByText('✓ Vérifié').first()).toBeVisible()
    await page.getByRole('button', { name: 'Continuer' }).click()

    const canvas = page.getByTestId('signature-canvas')
    const box = await canvas.boundingBox()
    if (!box) throw new Error('canvas introuvable')
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5)
    await page.mouse.down()
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(
        box.x + box.width * (0.2 + i * 0.06),
        box.y + box.height * (0.5 + Math.sin(i) * 0.2),
      )
    }
    await page.mouse.up()
    await page.getByRole('button', { name: 'Confirmer la signature' }).click()

    await expect(page.getByTestId('preapproval-panel')).toContainText('pré-approuvé')
    await page.getByTestId('submit-application').click()
    await expect(page.getByTestId('success-screen')).toContainText('Demande soumise !')
    await expect(page.getByText(/DHB-\d{4}-\d{6}/)).toBeVisible()
  })
})
