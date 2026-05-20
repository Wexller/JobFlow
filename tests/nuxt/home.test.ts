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
  it('renders the localized job search overview', async () => {
    const wrapper = await mountSuspended(HomePage)
    await flushPromises()

    expect(wrapper.text()).toContain('Keep your job search on track')
    expect(wrapper.text()).toContain('Total applications')
    expect(wrapper.text()).toContain('Active opportunities')
    expect(wrapper.text()).toContain('Northstar Labs')
    expect(wrapper.text()).toContain('SignalWorks')
    expect(wrapper.text()).toContain('Next actions')
    expect(wrapper.text()).toContain('Vacancies')
    expect(wrapper.text()).toContain('Collect roles, stacks, salaries, and priorities.')
    expect(wrapper.text()).toContain('Hiring steps')
    expect(wrapper.text()).toContain('Follow each process from application to decision.')
    expect(wrapper.text()).toContain('Interviews')
    expect(wrapper.text()).toContain('Offers')
    expect(wrapper.text()).not.toContain('Swipe horizontally to view all table columns.')
  })



  it('renders core russian copy after locale switch', async () => {
    const wrapper = await mountSuspended(HomePage, {
      route: '/',
    })
    await flushPromises()

    await wrapper.vm.$i18n.setLocale('ru')
    await flushPromises()

    expect(wrapper.text()).toContain('Поиск работы под контролем')
    expect(wrapper.text()).toContain('Следующие действия')
    expect(wrapper.text()).toContain('Интервью')
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
