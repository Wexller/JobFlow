import type { JobflowSnapshot } from '../schemas/jobflow.schema'

export function useJobflowSnapshot() {
  return useFetch<JobflowSnapshot>('/api/jobflow/snapshot', {
    default: () => undefined,
    key: 'jobflow-snapshot',
  })
}
