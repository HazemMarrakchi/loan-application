export interface KycOutcome {
  field: 'nationalId' | 'matriculeFiscal'
  status: 'verified' | 'rejected'
  message: string
}

function latency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 900))
}

export async function verifyNationalId(cin: string): Promise<KycOutcome> {
  await latency()
  if (cin.endsWith('0')) {
    return { field: 'nationalId', status: 'rejected', message: 'CIN introuvable dans le registre national.' }
  }
  return { field: 'nationalId', status: 'verified', message: 'Identité vérifiée — registre national.' }
}

export async function verifyMatriculeFiscal(matricule: string): Promise<KycOutcome> {
  await latency()
  if (matricule.startsWith('0000000')) {
    return { field: 'matriculeFiscal', status: 'rejected', message: 'Matricule fiscal inexistant (RNE).' }
  }
  return { field: 'matriculeFiscal', status: 'verified', message: 'Entreprise vérifiée — registre RNE.' }
}
