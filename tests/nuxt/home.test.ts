// @vitest-environment @nuxt/test-utils/vitest-environment
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { JobflowSnapshot } from '../../app/schemas/jobflow.schema'
import HomePage from '../../app/pages/index.vue'
import { mockInterviews, mockOffers, mockPipelineEvents, mockVacancies } from '../../app/repositories/mockData'

const snapshot: JobflowSnapshot = {
  interviews: mockInterviews,
  offers: mockOffers,
  pipelineEvents: mockPipelineEvents,
  vacancies: mockVacancies,
}

vi.mock('~/composables/useJobflowSnapshot', () => ({
  useJobflowSnapshot: () => Promise.resolve({
    data: ref(snapshot),
    error: ref(null),
    refresh: vi.fn(),
    status: ref('success'),
  }),
}))

describe('home page', () => {
  it('renders the localized dashboard from CRM data', async () => {
    const wrapper = await mountSuspended(HomePage)
    await flushPromises()

    expect(wrapper.text()).toContain('A job-search CRM with a server-backed workflow')
    expect(wrapper.text()).toContain('Total applications')
    expect(wrapper.text()).toContain('Active pipeline')
    expect(wrapper.text()).toContain('Northstar Labs')
    expect(wrapper.text()).toContain('SignalWorks')
    expect(wrapper.text()).toContain('Next actions')
    expect(wrapper.text()).toContain('Vacancies')
    expect(wrapper.text()).toContain('Open vacancy list and details page.')
    expect(wrapper.text()).toContain('Pipeline events')
    expect(wrapper.text()).toContain('Track pipeline timeline entries by stage and status.')
    expect(wrapper.text()).toContain('Interviews')
    expect(wrapper.text()).toContain('Offers')
  })

  it('does not render heavy management forms on home page', async () => {
    const wrapper = await mountSuspended(HomePage)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Add or edit vacancy')
    expect(wrapper.text()).not.toContain('Save vacancy')
    expect(wrapper.text()).not.toContain('Save pipeline event')
    expect(wrapper.text()).not.toContain('Save interview')
    expect(wrapper.text()).not.toContain('Save offer')
  })
})
