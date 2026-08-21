export interface PlaceEntry {
  governorate: string
  delegation: string
  postalCode: string
}

export const TUNISIA_PLACES: PlaceEntry[] = [
  { governorate: 'Tunis', delegation: 'El Menzah', postalCode: '1004' },
  { governorate: 'Tunis', delegation: 'La Marsa', postalCode: '2078' },
  { governorate: 'Tunis', delegation: 'Carthage', postalCode: '2016' },
  { governorate: 'Tunis', delegation: 'Le Bardo', postalCode: '2000' },
  { governorate: 'Tunis', delegation: 'El Omrane', postalCode: '1082' },
  { governorate: 'Ariana', delegation: 'Ariana Ville', postalCode: '2080' },
  { governorate: 'Ariana', delegation: 'La Soukra', postalCode: '2036' },
  { governorate: 'Ariana', delegation: 'Raoued', postalCode: '2081' },
  { governorate: 'Ben Arous', delegation: 'Ben Arous', postalCode: '2013' },
  { governorate: 'Ben Arous', delegation: 'Rades', postalCode: '2048' },
  { governorate: 'Ben Arous', delegation: 'Hammam Lif', postalCode: '2050' },
  { governorate: 'Manouba', delegation: 'Manouba', postalCode: '2010' },
  { governorate: 'Manouba', delegation: 'Denden', postalCode: '2092' },
  { governorate: 'Nabeul', delegation: 'Nabeul', postalCode: '8000' },
  { governorate: 'Nabeul', delegation: 'Hammamet', postalCode: '8050' },
  { governorate: 'Nabeul', delegation: 'Korba', postalCode: '8070' },
  { governorate: 'Zaghouan', delegation: 'Zaghouan', postalCode: '1100' },
  { governorate: 'Bizerte', delegation: 'Bizerte Nord', postalCode: '7000' },
  { governorate: 'Bizerte', delegation: 'Menzel Bourguiba', postalCode: '7050' },
  { governorate: 'Béja', delegation: 'Béja Nord', postalCode: '9000' },
  { governorate: 'Jendouba', delegation: 'Jendouba', postalCode: '8100' },
  { governorate: 'Le Kef', delegation: 'Le Kef', postalCode: '7100' },
  { governorate: 'Siliana', delegation: 'Siliana Sud', postalCode: '6100' },
  { governorate: 'Sousse', delegation: 'Sousse Médina', postalCode: '4000' },
  { governorate: 'Sousse', delegation: 'Sousse Riadh', postalCode: '4023' },
  { governorate: 'Sousse', delegation: 'Msaken', postalCode: '4070' },
  { governorate: 'Monastir', delegation: 'Monastir', postalCode: '5000' },
  { governorate: 'Monastir', delegation: 'Moknine', postalCode: '5050' },
  { governorate: 'Mahdia', delegation: 'Mahdia', postalCode: '5100' },
  { governorate: 'Sfax', delegation: 'Sfax Ville', postalCode: '3000' },
  { governorate: 'Sfax', delegation: 'Sakiet Ezzit', postalCode: '3021' },
  { governorate: 'Sfax', delegation: 'Sfax Ouest', postalCode: '3032' },
  { governorate: 'Kairouan', delegation: 'Kairouan Nord', postalCode: '3100' },
  { governorate: 'Kasserine', delegation: 'Kasserine Nord', postalCode: '1200' },
  { governorate: 'Sid Bouzid', delegation: 'Sidi Bouzid Est', postalCode: '9100' },
  { governorate: 'Gabès', delegation: 'Gabès Médina', postalCode: '6000' },
  { governorate: 'Gabès', delegation: 'Gabès Sud', postalCode: '6011' },
  { governorate: 'Gabès', delegation: 'Matmata', postalCode: '6070' },
  { governorate: 'Medenine', delegation: 'Medenine Sud', postalCode: '4100' },
  { governorate: 'Tataouine', delegation: 'Tataouine', postalCode: '3200' },
  { governorate: 'Gafsa', delegation: 'Gafsa Sud', postalCode: '2100' },
  { governorate: 'Tozeur', delegation: 'Tozeur', postalCode: '2200' },
  { governorate: 'Kébili', delegation: 'Kébili Ouest', postalCode: '4200' },
]

export const GOVERNORATES: string[] = [...new Set(TUNISIA_PLACES.map((p) => p.governorate))].sort(
  (a, b) => a.localeCompare(b, 'fr'),
)

export function searchPlaces(query: string, limit = 8): PlaceEntry[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return TUNISIA_PLACES.filter(
    (p) =>
      p.delegation.toLowerCase().includes(q) ||
      p.governorate.toLowerCase().includes(q) ||
      p.postalCode.startsWith(q),
  ).slice(0, limit)
}
