import { z } from 'zod'

export const entityIdSchema = z.string().trim().min(1)

const isoDatePattern =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d{3})?(Z|[+-]\d{2}:\d{2}))?$/

function isRealIsoDate(value: string): boolean {
  const match = isoDatePattern.exec(value)

  if (!match) {
    return false
  }

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue, offsetValue] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)

  if (month < 1 || month > 12) {
    return false
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  if (day < 1 || day > daysInMonth) {
    return false
  }

  if (hourValue === undefined) {
    return true
  }

  const hour = Number(hourValue)
  const minute = Number(minuteValue)
  const second = Number(secondValue)

  if (hour > 23 || minute > 59 || second > 59) {
    return false
  }

  if (offsetValue === undefined || offsetValue === 'Z') {
    return true
  }

  const [offsetHour = 0, offsetMinute = 0] = offsetValue.slice(1).split(':').map(Number)
  return offsetHour <= 23 && offsetMinute <= 59
}

export const isoDateSchema = z.string().refine(
  isRealIsoDate,
  'Expected a real ISO date or datetime string',
)

export const optionalTextSchema = z.string().trim().optional()

export const moneyAmountSchema = z.number().finite().nonnegative()

export const percentageSchema = z.number().finite().min(0).max(100)

export function isValidMoneyRange(range: {
  salaryMin?: number
  salaryMax?: number
}): boolean {
  return range.salaryMin === undefined || range.salaryMax === undefined || range.salaryMin <= range.salaryMax
}
