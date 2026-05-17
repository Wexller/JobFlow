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
    expect(wrapper.text()).toContain('Vacancies')
    expect(wrapper.text()).toContain('Reset filters')
    expect(wrapper.text()).toContain('Highest salary first')
    expect(wrapper.text()).toContain('Kanban by status')
    expect(wrapper.text()).toContain('No vacancies in this status.')
    expect(wrapper.text()).toContain('Pipeline timeline')
    expect(wrapper.text()).toContain('Vue architecture interview')
    expect(wrapper.text()).toContain('Strong product engineering fit.')
  })
})
