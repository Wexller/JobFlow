// @vitest-environment @nuxt/test-utils/vitest-environment
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JobflowSnapshot } from '../../app/schemas/jobflow.schema'
import InterviewsPage from '../../app/pages/interviews.vue'
import OffersPage from '../../app/pages/offers.vue'
import PipelineEventsPage from '../../app/pages/pipeline-events.vue'
import { mockInterviews, mockOffers, mockPipelineEvents, mockVacancies } from '../../app/repositories/mockData'
import VacancySelectField from '../../app/components/home/VacancySelectField.vue'

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

const _VacancySelectFieldStub = defineComponent({
  props: {
    emptySearchMessage: { type: String, required: true },
    label: { type: String, required: true },
    modelValue: { type: String, default: '' },
    noVacancyLabel: { type: String, required: true },
    searchPlaceholder: { type: String, required: true },
    vacancies: { type: Array, required: true },
  },
  emits: ['update:modelValue'],
  template: `
    <label>
      <span>{{ label }}</span>
      <select
        data-testid="vacancy-page-select"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="">{{ noVacancyLabel }}</option>
        <option
          v-for="vacancy in vacancies"
          :key="vacancy.id"
          :value="vacancy.id"
        >
          {{ vacancy.company }} · {{ vacancy.role }}
        </option>
      </select>
    </label>
  `,
})

const FormStub = defineComponent({
  props: {
    interview: { type: Object, required: false },
    offer: { type: Object, required: false },
    pipelineEvent: { type: Object, required: false },
    status: { type: String, required: false },
    vacancyId: { type: String, required: false },
  },
  template: `
    <div data-testid="form-state">
      vacancy={{ vacancyId ?? 'none' }};
      entity={{ interview?.id ?? offer?.id ?? pipelineEvent?.id ?? 'none' }}
    </div>
  `,
})

const USelectMenuStub = defineComponent({
  props: {
    items: { type: Array, required: true },
    labelKey: { type: String, default: 'label' },
    modelValue: { type: String, default: '' },
    searchInput: { type: [Boolean, Object], default: true },
    valueKey: { type: String, default: 'value' },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      searchTerm: '',
    }
  },
  computed: {
    filteredItems(): Array<Record<string, string>> {
      return (this.items as Array<Record<string, string>>).filter((item) => {
        const label = String(item[this.labelKey] ?? '').toLowerCase()
        return label.includes(this.searchTerm.toLowerCase())
      })
    },
    searchPlaceholderText(): string {
      return typeof this.searchInput === 'object'
        ? String((this.searchInput as { placeholder?: string }).placeholder ?? '')
        : ''
    },
  },
  template: `
    <div>
      <input
        data-testid="vacancy-search"
        :placeholder="searchPlaceholderText"
        v-model="searchTerm"
      >
      <select
        data-testid="vacancy-select"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option
          v-for="item in filteredItems"
          :key="item[valueKey]"
          :value="item[valueKey]"
        >
          {{ item[labelKey] }}
        </option>
      </select>
      <div v-if="filteredItems.length === 0" data-testid="vacancy-empty">
        <slot name="empty" />
      </div>
    </div>
  `,
})

describe('vacancy select field', () => {
  it('filters searchable vacancies and emits the selected vacancy id', async () => {
    const wrapper = await mountSuspended(VacancySelectField, {
      global: {
        stubs: {
          USelectMenu: USelectMenuStub,
        },
      },
      props: {
        emptySearchMessage: 'No vacancies match your search.',
        label: 'Vacancy',
        modelValue: '',
        noVacancyLabel: 'All vacancies',
        searchPlaceholder: 'Search vacancies',
        vacancies: mockVacancies,
      },
    })

    await flushPromises()

    const search = wrapper.get('[data-testid="vacancy-search"]')
    expect(search.attributes('placeholder')).toBe('Search vacancies')

    await search.setValue('signal')
    await flushPromises()

    const options = wrapper.findAll('[data-testid="vacancy-select"] option')
    expect(options).toHaveLength(1)
    expect(options[0]?.text()).toContain('SignalWorks')

    await wrapper.get('[data-testid="vacancy-select"]').setValue('vacancy-product-crm')

    expect(wrapper.emitted('update:modelValue')).toEqual([['vacancy-product-crm']])
  })

  it('uses a non-empty internal value for the all-vacancies option while keeping the external model empty', async () => {
    const wrapper = await mountSuspended(VacancySelectField, {
      global: {
        stubs: {
          USelectMenu: USelectMenuStub,
        },
      },
      props: {
        emptySearchMessage: 'No vacancies match your search.',
        label: 'Vacancy',
        modelValue: '',
        noVacancyLabel: 'All vacancies',
        searchPlaceholder: 'Search vacancies',
        vacancies: mockVacancies,
      },
    })

    await flushPromises()

    const options = wrapper.findAll('[data-testid="vacancy-select"] option')
    expect(options[0]?.attributes('value')).toBe('__all_vacancies__')

    await wrapper.get('[data-testid="vacancy-select"]').setValue('vacancy-product-crm')
    await wrapper.get('[data-testid="vacancy-select"]').setValue('__all_vacancies__')

    expect(wrapper.emitted('update:modelValue')).toEqual([['vacancy-product-crm'], ['']])
  })

  it('renders an empty-state message when the search has no matches', async () => {
    const wrapper = await mountSuspended(VacancySelectField, {
      global: {
        stubs: {
          USelectMenu: USelectMenuStub,
        },
      },
      props: {
        emptySearchMessage: 'No vacancies match your search.',
        label: 'Vacancy',
        noVacancyLabel: 'All vacancies',
        searchPlaceholder: 'Search vacancies',
        vacancies: mockVacancies,
      },
    })

    await wrapper.get('[data-testid="vacancy-search"]').setValue('unmatched')
    await flushPromises()

    expect(wrapper.get('[data-testid="vacancy-empty"]').text()).toContain('No vacancies match your search.')
  })
})

describe('vacancy-driven management pages', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps interviews filtered by the selected vacancy and preserves the default selection', async () => {
    const wrapper = await mountSuspended(InterviewsPage, {
      global: {
        stubs: {
          HomeInterviewForm: FormStub,
        },
      },
    })

    await flushPromises()

    expect(wrapper.get('[data-testid="form-state"]').text()).toContain('vacancy=vacancy-frontend-platform')
    expect(wrapper.text()).toContain('Technical interview')
    expect(wrapper.text()).not.toContain('Recruiter screen')

    await selectVacancy(wrapper, 'SignalWorks · Product Engineer')

    expect(wrapper.get('[data-testid="form-state"]').text()).toContain('vacancy=vacancy-product-crm')
    expect(wrapper.text()).toContain('Recruiter screen')
    expect(wrapper.text()).not.toContain('Technical interview')
  })

  it('keeps offers bound to the selected vacancy and shows results after switching from the default selection', async () => {
    const wrapper = await mountSuspended(OffersPage, {
      global: {
        stubs: {
          HomeOfferForm: FormStub,
        },
      },
    })

    await flushPromises()

    expect(wrapper.get('[data-testid="form-state"]').text()).toContain('vacancy=vacancy-frontend-platform')
    expect(wrapper.text()).toContain('No offers available.')

    await selectVacancy(wrapper, 'Atlas Cloud · Design Systems Engineer')

    expect(wrapper.get('[data-testid="form-state"]').text()).toContain('vacancy=vacancy-design-systems')
    expect(wrapper.text()).toContain('Pending')
    expect(wrapper.text()).not.toContain('No offers available.')
  })

  it('keeps pipeline events filtered by the selected vacancy and updates the visible event count', async () => {
    const wrapper = await mountSuspended(PipelineEventsPage, {
      global: {
        stubs: {
          HomePipelineEventForm: FormStub,
        },
      },
    })

    await flushPromises()

    expect(wrapper.get('[data-testid="form-state"]').text()).toContain('vacancy=vacancy-frontend-platform')
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.text()).toContain('Vue architecture interview')

    await selectVacancy(wrapper, 'Atlas Cloud · Design Systems Engineer')

    expect(wrapper.get('[data-testid="form-state"]').text()).toContain('vacancy=vacancy-design-systems')
    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Vue architecture interview')
  })
})

async function selectVacancy(wrapper: Awaited<ReturnType<typeof mountSuspended>>, optionLabel: string) {
  await wrapper.get('button[aria-haspopup="listbox"]').trigger('click')
  await flushPromises()

  const option = Array.from(document.body.querySelectorAll('[role="option"]'))
    .find((element) => element.textContent?.includes(optionLabel))

  expect(option, `Expected combobox option "${optionLabel}" to be rendered`).toBeTruthy()

  ;(option as HTMLElement).click()
  await flushPromises()
}
