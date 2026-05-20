import { STATUS_LABELS, normalizeStatus, optionalArg, parseArgs, requiredArg, runGh } from './common.mjs'

const args = parseArgs(process.argv.slice(2))
const issue = requiredArg(args, 'issue')
const status = normalizeStatus(requiredArg(args, 'status'))
const comment = optionalArg(args, 'comment')

runGh([
  'issue',
  'edit',
  issue,
  '--remove-label',
  STATUS_LABELS.join(','),
])

runGh([
  'issue',
  'edit',
  issue,
  '--add-label',
  status,
])

if (status === 'status:done') {
  const closeArgs = ['issue', 'close', issue, '--reason', 'completed']
  if (comment.length > 0) {
    closeArgs.push('--comment', comment)
  }
  runGh(closeArgs)
}
else if (comment.length > 0) {
  runGh(['issue', 'comment', issue, '--body', comment])
}

console.log(`updated #${issue} -> ${status}`)
