import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS, runGh } from './common.mjs'

const labelDefinitions = {
  'type:feat': { color: '1D76DB', description: 'New capability or user-facing outcome' },
  'type:fix': { color: 'D73A4A', description: 'Defect, regression, or incorrect behavior' },
  'type:ref': { color: '8A63D2', description: 'Structural or maintainability improvement' },
  'status:new': { color: 'BFDADC', description: 'Newly created issue' },
  'status:triage': { color: 'FBCA04', description: 'Needs prioritization or classification refinement' },
  'status:discovery': { color: 'F9D0C4', description: 'Needs research, clarification, or investigation' },
  'status:planned': { color: 'C5DEF5', description: 'Planned with a defined implementation direction' },
  'status:in_progress': { color: '0E8A16', description: 'Implementation is in progress' },
  'status:in_review': { color: '5319E7', description: 'PR is open and under review' },
  'status:released': { color: '0052CC', description: 'Merged and awaiting confirmed production release' },
  'status:done': { color: '0B7285', description: 'Confirmed released to production' },
  'status:cancelled': { color: '6A737D', description: 'Cancelled and no longer planned' },
  'priority:high': { color: 'B60205', description: 'High-priority work item' },
  'priority:medium': { color: 'FBCA04', description: 'Medium-priority work item' },
  'priority:low': { color: '0E8A16', description: 'Low-priority work item' },
}

for (const label of [...TYPE_LABELS, ...STATUS_LABELS, ...PRIORITY_LABELS]) {
  const definition = labelDefinitions[label]
  runGh([
    'label',
    'create',
    label,
    '--color',
    definition.color,
    '--description',
    definition.description,
    '--force',
  ])
  console.log(`synced ${label}`)
}
