// @vitest-environment @nuxt/test-utils/vitest-environment
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import HomePage from '../../app/pages/index.vue'

describe('home page', () => {
  it('renders the localized dashboard from mock CRM data', async () => {
    const wrapper = await mountSuspended(HomePage)

    expect(wrapper.text()).toContain('A job-search CRM on top of Google Sheets')
    expect(wrapper.text()).toContain('Total applications')
    expect(wrapper.text()).toContain('Active pipeline')
    expect(wrapper.text()).toContain('Northstar Labs')
    expect(wrapper.text()).toContain('SignalWorks')
    expect(wrapper.text()).toContain('Next actions')
  })
})
