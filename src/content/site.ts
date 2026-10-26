import type { MessageKey } from '../i18n/types'

// Confirmed site facts (docs/DECISIONS_AND_ASSUMPTIONS.md). Write each fact once here.
// `null` means the client has not confirmed it yet; pages render <Pending> for it.

export type FleetItem = {
  id: 'isuzu-frr33' | 'fuso-fh'
  name: string
  /** i18n key for the body description, e.g. 'fleet.isuzuBody' */
  bodyKey: MessageKey
  payload: string | null
  size: string | null
}

export type AreaGroup = {
  id: 'nairobi' | 'kajiado' | 'machakos' | 'thika'
  places: string[]
}

const fleet: readonly FleetItem[] = [
  { id: 'isuzu-frr33', name: 'Isuzu FRR 33', bodyKey: 'fleet.isuzuBody', payload: null, size: null },
  { id: 'fuso-fh', name: 'Mitsubishi Fuso FH', bodyKey: 'fleet.fusoBody', payload: null, size: null },
]

const areaGroups: readonly AreaGroup[] = [
  { id: 'nairobi', places: ['Nairobi metropolitan area'] },
  { id: 'kajiado', places: ['Kitengela', 'Birika', 'Ongata Rongai', 'Kajiado Town'] },
  { id: 'machakos', places: ['Athi River', 'Syokimau', 'Machakos Town'] },
  { id: 'thika', places: ['Thika', 'Juja', 'Ruiru', 'Gatundu'] },
]

export const site = {
  legalName: 'Kims Cargo & Logistics',
  brandName: 'Kims Cargo & Logistics',
  /** Both numbers take calls, SMS and WhatsApp (D-26). Index 0 is the WhatsApp default. */
  phones: [{ display: '0745 822 788' }, { display: '0783 330 889' }],
  email: 'kimsandcargos1@gmail.com',
  hours: { days: 'Monday to Saturday', weekdays: '6 am to 7 pm', sunday: 'by arrangement' },
  fleet,
  longRoutes: [
    ['Nairobi', 'Nakuru', 'Eldoret'],
    ['Nairobi', 'Mombasa'],
  ] as readonly string[][],
  areaGroups,
  pending: {
    payload: null,
    bedSize: null,
    kraPin: null,
    transitCover: null,
    yardAddress: null,
    companyStory: null,
  } as const,
} as const
