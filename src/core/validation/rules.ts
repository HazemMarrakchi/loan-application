import { z } from 'zod'

export const cinSchema = z
  .string()
  .regex(/^[01]\d{7}$/, 'CIN invalide : 8 chiffres commençant par 0 ou 1')

export const phoneSchema = z
  .string()
  .regex(/^(\+216)?\s?[2459]\d{7}$/, 'Numéro tunisien invalide (8 chiffres, commence par 2/4/5/9)')

export const postalCodeSchema = z.string().regex(/^\d{4}$/, 'Code postal : 4 chiffres')

export const matriculeFiscalSchema = z
  .string()
  .regex(/^\d{7}\/[A-Z]\/[A-Z0-9]\/\d{3}$/, 'Format attendu : 1234567/A/M/000')

export const emailSchema = z.string().email('Adresse e-mail invalide')

export const adultBirthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
  .refine((value) => {
    const birth = new Date(value)
    if (Number.isNaN(birth.getTime())) return false
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1
    return age >= 18 && age <= 100
  }, 'Vous devez avoir entre 18 et 100 ans')

export function moneyField(min: number, max: number, label: string) {
  return z.coerce
    .number({ message: `${label} requis` })
    .min(min, `Minimum : ${min.toLocaleString('fr-TN')} TND`)
    .max(max, `Maximum : ${max.toLocaleString('fr-TN')} TND`)
}
