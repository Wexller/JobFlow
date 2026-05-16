import { describe, expect, it } from 'vitest'
import en from '../../i18n/locales/en.json'
import ru from '../../i18n/locales/ru.json'

describe('i18n locale messages', () => {
  it('keeps required top-level namespaces in sync', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort())
  })

  it('defines the application name in both supported locales', () => {
    expect(en.app.name).toBe('Jobflow')
    expect(ru.app.name).toBe('Jobflow')
  })
})
