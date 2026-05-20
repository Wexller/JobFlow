import { maybeReadFile, parseSpecSections, runGh, buildIssueBody, buildIssueTitle } from './common.mjs'

const banks = [
  { file: 'docs/feature-bank.md', type: 'feat' },
  { file: 'docs/refactor-bank.md', type: 'ref' },
  { file: 'docs/fix-bank.md', type: 'fix' },
]

const scopeMap = {
  'FEAT-001': ['sheets', 'server', 'db'],
  'FEAT-002': ['auth', 'permissions'],
  'FEAT-003': ['sync', 'server'],
  'FEAT-004': ['home', 'layout', 'navigation'],
  'FEAT-005': ['data', 'ui', 'import-export'],
  'FEAT-006': ['backup', 'ops', 'db'],
  'FEAT-007': ['docs', 'onboarding', 'ui'],
  'FEAT-008': ['mobile', 'ui', 'layout'],
  'FEAT-009': ['copy', 'i18n', 'ui'],
  'FEAT-010': ['home', 'marketing', 'ui'],
  'FEAT-011': ['vacancies', 'forms'],
  'FEAT-012': ['layout', 'desktop'],
  'REF-001': ['store', 'pinia'],
  'REF-002': ['db', 'migrations', 'deploy'],
  'REF-003': ['types', 'domain', 'ui'],
  'FIX-001': ['home', 'mobile', 'table'],
  'FIX-002': ['home', 'mobile', 'dashboard'],
  'FIX-003': ['mobile', 'layout', 'ui'],
  'FIX-004': ['dashboard', 'mobile', 'layout'],
}

const dryRun = process.argv.includes('--dry-run')

for (const bank of banks) {
  const markdown = maybeReadFile(bank.file)
  if (markdown === undefined) {
    continue
  }

  for (const line of markdown.split('\n')) {
    if (!line.startsWith('| FEAT-') && !line.startsWith('| REF-') && !line.startsWith('| FIX-')) {
      continue
    }

    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    const [legacyId, title, problem, value, priorityRaw, status, branch, pr, release, updated] = cells

    if (status === 'done' || status === 'cancelled') {
      continue
    }

    const scopes = scopeMap[legacyId]
    if (scopes === undefined) {
      throw new Error(`No scope mapping defined for ${legacyId}`)
    }

    const search = runGh([
      'issue',
      'list',
      '--state',
      'all',
      '--search',
      `"Legacy ID: ${legacyId}" in:body`,
      '--json',
      'number,title,url',
    ])

    const existing = JSON.parse(search)
    if (existing.length > 0) {
      console.log(`skip ${legacyId}: already migrated as #${existing[0].number}`)
      continue
    }

    const activeSpecPath = `docs/workitems/${legacyId}.md`
    const archivedSpecPath = `docs/workitems/done/${legacyId}.md`
    const specMarkdown = maybeReadFile(activeSpecPath) ?? maybeReadFile(archivedSpecPath)
    const spec = specMarkdown === undefined ? {} : parseSpecSections(specMarkdown)
    const priority = `priority:${priorityRaw.toLowerCase()}`
    const statusLabel = `status:${status}`
    const legacySpecPath = specMarkdown === undefined ? '' : (maybeReadFile(activeSpecPath) === undefined ? archivedSpecPath : activeSpecPath)

    const issueTitle = buildIssueTitle({
      type: bank.type,
      scopes,
      title,
    })

    const issueBody = buildIssueBody({
      type: bank.type,
      scopes,
      priority,
      summary: spec.summary ?? '',
      goals: spec.goals ?? '',
      scope: spec.scope ?? '',
      nonGoals: spec.nonGoals ?? '',
      affectedAreas: spec.affectedAreas ?? '',
      acceptanceCriteria: spec.acceptanceCriteria ?? '',
      risks: spec.risks ?? '',
      verification: spec.verification ?? '',
      legacyId,
      legacyStatus: status,
      legacyProblem: problem,
      legacyValue: value,
      legacyUpdated: updated,
      legacySpecPath,
      legacyBranch: branch,
      legacyPr: pr,
      legacyRelease: release,
    })

    if (dryRun) {
      console.log(`would create: ${issueTitle}`)
      continue
    }

    const url = runGh([
      'issue',
      'create',
      '--title',
      issueTitle,
      '--body',
      issueBody,
      '--label',
      `type:${bank.type}`,
      '--label',
      statusLabel,
      '--label',
      priority,
    ])

    console.log(`${legacyId} -> ${url}`)
  }
}
