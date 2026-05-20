import {
  buildIssueBody,
  buildIssueTitle,
  normalizePriority,
  normalizeStatus,
  normalizeType,
  optionalArg,
  parseArgs,
  parseScopes,
  requiredArg,
  runGh,
} from './common.mjs'

const args = parseArgs(process.argv.slice(2))
const type = normalizeType(requiredArg(args, 'type'))
const scopes = parseScopes(requiredArg(args, 'scopes'))
const title = requiredArg(args, 'title')
const priority = normalizePriority(optionalArg(args, 'priority', 'medium'))
const status = normalizeStatus(optionalArg(args, 'status', 'new'))

const issueTitle = buildIssueTitle({ type, scopes, title })
const issueBody = buildIssueBody({
  type,
  scopes,
  priority,
  summary: optionalArg(args, 'summary'),
  goals: optionalArg(args, 'goals'),
  scope: optionalArg(args, 'scope'),
  nonGoals: optionalArg(args, 'non-goals'),
  affectedAreas: optionalArg(args, 'affected-areas'),
  acceptanceCriteria: optionalArg(args, 'acceptance-criteria'),
  risks: optionalArg(args, 'risks'),
  verification: optionalArg(args, 'verification'),
  legacyId: optionalArg(args, 'legacy-id'),
  legacyStatus: optionalArg(args, 'legacy-status'),
  legacyProblem: optionalArg(args, 'legacy-problem'),
  legacyValue: optionalArg(args, 'legacy-value'),
  legacyUpdated: optionalArg(args, 'legacy-updated'),
  legacySpecPath: optionalArg(args, 'legacy-spec-path'),
})

const url = runGh([
  'issue',
  'create',
  '--title',
  issueTitle,
  '--body',
  issueBody,
  '--label',
  `type:${type}`,
  '--label',
  status,
  '--label',
  priority,
])

console.log(url)
