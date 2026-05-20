import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const localePath = (locale: string) =>
  resolve(process.cwd(), 'i18n', 'locales', `${locale}.json`)

const en = JSON.parse(readFileSync(localePath('en'), 'utf8'))
const ru = JSON.parse(readFileSync(localePath('ru'), 'utf8'))

function collectMessagePaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix]
  }

  return Object.entries(value)
    .flatMap(([key, nestedValue]) => collectMessagePaths(nestedValue, prefix ? `${prefix}.${key}` : key))
    .sort()
}

describe('i18n locale messages', () => {
  it('keeps required top-level namespaces in sync', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort())
  })

  it('keeps nested message keys in sync', () => {
    expect(collectMessagePaths(ru)).toEqual(collectMessagePaths(en))
  })

  it('defines the application name in both supported locales', () => {
    expect(en.app.name).toBe('Jobflow')
    expect(ru.app.name).toBe('Jobflow')
  })
})
