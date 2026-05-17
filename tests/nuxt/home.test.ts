// @vitest-environment @nuxt/test-utils/vitest-environment
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import HomePage from '../../app/pages/index.vue'

describe('home page', () => {
  it('renders the localized MVP scaffold content', async () => {
    const wrapper = await mountSuspended(HomePage)

    expect(wrapper.text()).toContain('A job-search CRM on top of Google Sheets')
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Vacancies')
    expect(wrapper.text()).toContain('Google Sheets')
  })
})
