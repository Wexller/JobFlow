export const offerDecisionIds = [
  'pending',
  'accepted',
  'declined',
  'expired',
  'withdrawn',
  'unknown',
] as const

export type OfferDecisionId = typeof offerDecisionIds[number]
