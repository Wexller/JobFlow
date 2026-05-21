import { execFileSync } from 'node:child_process'

function parseArgs(argv) {
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

    args[key] = value
  }

  return args
}

function requiredArg(args, key) {
  const value = args[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required argument --${key}`)
  }

  return value.trim()
}

function runGit(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim()
}

function runGitStreaming(args) {
  execFileSync('git', args, {
    stdio: 'inherit',
  })
}

function ensureCleanWorktree() {
  const output = runGit(['status', '--short'])
  if (output.length > 0) {
    throw new Error('Worktree must be clean before creating a release branch')
  }
}

function ensureSemver(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Version must match x.y.z: ${version}`)
  }
}

function ensureBranchMissing(branchName) {
  const local = runGit(['branch', '--list', branchName])
  if (local.length > 0) {
    throw new Error(`Local branch already exists: ${branchName}`)
  }

  const remote = runGit(['ls-remote', '--heads', 'origin', branchName])
  if (remote.length > 0) {
    throw new Error(`Remote branch already exists: ${branchName}`)
  }
}

function getCurrentRef() {
  const currentBranch = runGit(['branch', '--show-current'])
  return currentBranch.length > 0 ? currentBranch : runGit(['rev-parse', '--short', 'HEAD'])
}

function ensureSyncedMain() {
  const currentBranch = runGit(['branch', '--show-current'])
  runGitStreaming(['fetch', 'origin', 'main'])

  if (currentBranch !== 'main') {
    runGitStreaming(['checkout', 'main'])
  }

  runGitStreaming(['pull', '--ff-only', 'origin', 'main'])
}

function restoreOriginalRef(originalRef, createdBranch) {
  if (originalRef === createdBranch) {
    return
  }

  runGitStreaming(['checkout', originalRef])
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const version = requiredArg(args, 'version')
  const branchName = `release/${version}`

  ensureSemver(version)
  ensureCleanWorktree()
  ensureBranchMissing(branchName)

  const originalRef = getCurrentRef()

  try {
    ensureSyncedMain()
    runGitStreaming(['checkout', '-b', branchName])
    runGitStreaming(['push', '--set-upstream', 'origin', branchName])
  } catch (error) {
    restoreOriginalRef(originalRef, branchName)
    throw error
  }

  console.log(`Created and pushed ${branchName}`)
  console.log('Next steps:')
  console.log('- Run release quality gates from this branch')
  console.log('- Build and deploy the Docker image from this release branch')
  console.log('- Keep the branch as the release record until production release is confirmed')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
