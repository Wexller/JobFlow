import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const localePath = (locale: string) =>
  resolve(process.cwd(), 'i18n', 'locales', `${locale}.json`)

const en = JSON.parse(readFileSync(localePath('en'), 'utf8'))
const ru = JSON.parse(readFileSync(localePath('ru'), 'utf8'))

describe('i18n locale messages', () => {
  it('keeps required top-level namespaces in sync', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort())
  })

  it('defines the application name in both supported locales', () => {
    expect(en.app.name).toBe('Jobflow')
    expect(ru.app.name).toBe('Jobflow')
  })
})
