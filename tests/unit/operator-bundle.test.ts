import { describe, expect, it } from 'vitest'
import { previewOperatorBundle } from '../../server/application/operatorBundle'

describe('operator bundle preview', () => {
  it('builds structured draft and keeps enum ids stable', () => {
    const draft = previewOperatorBundle([
      'company: ACME',
      'role: Senior Frontend Engineer',
      'status: interviewing',
      'priority: high',
      'format: remote',
      'techStack: Nuxt, TypeScript',
    ].join('\n'))

    expect(draft.vacancy).toMatchObject({
      company: 'ACME',
      format: 'remote',
      priority: 'high',
      role: 'Senior Frontend Engineer',
      status: 'interviewing',
      techStack: ['Nuxt', 'TypeScript'],
    })
    expect(draft.offer).toBeNull()
    expect(Array.isArray(draft.warnings)).toBe(true)
  })

  it('does not invent required text fields', () => {
    const draft = previewOperatorBundle('status: applied')
    expect(draft.vacancy).toMatchObject({
      company: '',
      role: '',
      status: 'applied',
    })
    expect(draft.warnings).toContain('company and role are required for safe vacancy creation')
  })
})
