import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

export const STATUS_LABELS = [
  'status:new',
  'status:triage',
  'status:discovery',
  'status:planned',
  'status:in_progress',
  'status:in_review',
  'status:released',
  'status:done',
  'status:cancelled',
]

export const PRIORITY_LABELS = [
  'priority:high',
  'priority:medium',
  'priority:low',
]

export const TYPE_LABELS = [
  'type:feat',
  'type:fix',
  'type:ref',
]

export function parseArgs(argv) {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      continue
    }

    const key = token.slice(2)
    const next = argv[index + 1]
    const value = next !== undefined && !next.startsWith('--') ? next : true

    if (value !== true) {
      index += 1
    }

    if (args[key] === undefined) {
      args[key] = value
      continue
    }

    if (Array.isArray(args[key])) {
      args[key].push(value)
      continue
    }

    args[key] = [args[key], value]
  }

  return args
}

export function requiredArg(args, key) {
  const value = args[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required argument --${key}`)
  }

  return value.trim()
}

export function optionalArg(args, key, fallback = '') {
  const value = args[key]
  return typeof value === 'string' ? value.trim() : fallback
}

export function hasFlag(args, key) {
  return args[key] === true
}

export function normalizeType(value) {
  if (value !== 'feat' && value !== 'fix' && value !== 'ref') {
    throw new Error(`Unsupported type: ${value}`)
  }

  return value
}

export function normalizeStatus(value) {
  const normalized = value.startsWith('status:') ? value : `status:${value}`
  if (!STATUS_LABELS.includes(normalized)) {
    throw new Error(`Unsupported status label: ${value}`)
  }

  return normalized
}

export function normalizePriority(value) {
  const normalized = value.startsWith('priority:') ? value : `priority:${value}`
  if (!PRIORITY_LABELS.includes(normalized)) {
    throw new Error(`Unsupported priority label: ${value}`)
  }

  return normalized
}

export function parseScopes(value) {
  const scopes = value
    .split(',')
    .map((scope) => scope.trim().toLowerCase())
    .filter(Boolean)

  if (scopes.length === 0 || scopes.length > 3) {
    throw new Error('Scopes must contain between 1 and 3 values')
  }

  const invalid = scopes.find((scope) => !/^[a-z0-9-]+$/.test(scope))
  if (invalid) {
    throw new Error(`Invalid scope: ${invalid}`)
  }

  return scopes
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function buildIssueTitle({ type, scopes, title }) {
  return `[${type}][${scopes.join(',')}] ${title.trim()}`
}

function section(title, value, fallback = '_TBD_') {
  const content = value.trim().length > 0 ? value.trim() : fallback
  return `## ${title}\n\n${content}`
}

export function buildIssueBody({
  type,
  scopes,
  priority,
  summary = '',
  goals = '',
  scope = '',
  nonGoals = '',
  affectedAreas = '',
  acceptanceCriteria = '',
  risks = '',
  verification = '',
  legacyId = '',
  legacyStatus = '',
  legacyProblem = '',
  legacyValue = '',
  legacyUpdated = '',
  legacySpecPath = '',
  legacyBranch = '',
  legacyPr = '',
  legacyRelease = '',
}) {
  const metadata = [
    '## Metadata',
    `- Type: ${type}`,
    `- Scopes: ${scopes.join(', ')}`,
    `- Priority: ${priority.replace('priority:', '')}`,
    legacyId ? `- Legacy ID: ${legacyId}` : '',
    legacyStatus ? `- Legacy Status: ${legacyStatus}` : '',
    legacyUpdated ? `- Legacy Updated: ${legacyUpdated}` : '',
    legacySpecPath ? `- Legacy Spec Path: ${legacySpecPath}` : '',
    legacyBranch && legacyBranch !== '-' ? `- Legacy Branch: ${legacyBranch}` : '',
    legacyPr && legacyPr !== '-' ? `- Legacy PR: ${legacyPr}` : '',
    legacyRelease && legacyRelease !== '-' ? `- Legacy Release: ${legacyRelease}` : '',
  ].filter(Boolean).join('\n')

  const legacyContext = legacyProblem.trim().length > 0 || legacyValue.trim().length > 0
    ? [
        '## Legacy Context',
        legacyProblem.trim().length > 0 ? `- Problem: ${legacyProblem.trim()}` : '',
        legacyValue.trim().length > 0 ? `- Value: ${legacyValue.trim()}` : '',
      ].filter(Boolean).join('\n')
    : ''

  return [
    metadata,
    legacyContext,
    section('Summary', summary || legacyProblem),
    section('Goals', goals || legacyValue),
    section('Scope', scope),
    section('Non-Goals', nonGoals),
    section('Affected Areas', affectedAreas),
    section('Acceptance Criteria', acceptanceCriteria),
    section('Risks', risks),
    section('Verification', verification),
  ].filter(Boolean).join('\n\n')
}

export function runGh(args, options = {}) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options,
  }).trim()
}

export function maybeReadFile(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined
}

export function parseSpecSections(markdown) {
  const sections = {}
  let currentSection

  for (const line of markdown.split('\n')) {
    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      currentSection = heading[1].trim()
      sections[currentSection] = []
      continue
    }

    if (currentSection !== undefined) {
      sections[currentSection].push(line)
    }
  }

  return {
    summary: (sections.Summary ?? []).join('\n').trim(),
    goals: (sections.Goals ?? []).join('\n').trim(),
    scope: (sections.Scope ?? []).join('\n').trim(),
    nonGoals: (sections['Non-Goals'] ?? []).join('\n').trim(),
    affectedAreas: (sections['Affected Areas'] ?? []).join('\n').trim(),
    acceptanceCriteria: (sections['Acceptance Criteria'] ?? []).join('\n').trim(),
    risks: (sections.Risks ?? []).join('\n').trim(),
    verification: (sections.Verification ?? []).join('\n').trim(),
  }
}
