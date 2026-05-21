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
    throw new Error('Worktree must be clean before creating a release tag')
  }
}

function ensureSemver(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Version must match x.y.z: ${version}`)
  }
}

function ensureOnMain() {
  const branch = runGit(['branch', '--show-current'])
  if (branch !== 'main') {
    throw new Error('Release tags can be created only from local main branch')
  }
}

function fetchMainAndTags() {
  runGitStreaming(['fetch', 'origin', 'main', '--tags'])
}

function ensureMainSyncedWithOrigin() {
  const localMain = runGit(['rev-parse', 'main'])
  const originMain = runGit(['rev-parse', 'origin/main'])

  if (localMain !== originMain) {
    throw new Error('Local main is not aligned with origin/main. Run: git pull --ff-only origin main')
  }
}

function ensureTagMissing(tagName) {
  const localTag = runGit(['tag', '--list', tagName])
  if (localTag.length > 0) {
    throw new Error(`Local tag already exists: ${tagName}`)
  }

  const remoteTag = runGit(['ls-remote', '--tags', 'origin', `refs/tags/${tagName}`])
  if (remoteTag.length > 0) {
    throw new Error(`Remote tag already exists on origin: ${tagName}`)
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const version = requiredArg(args, 'version')
  const tagName = `v${version}`

  ensureSemver(version)
  ensureCleanWorktree()
  ensureOnMain()
  fetchMainAndTags()
  ensureMainSyncedWithOrigin()
  ensureTagMissing(tagName)

  runGitStreaming(['tag', '-a', tagName, '-m', `Release ${tagName}`])
  runGitStreaming(['push', 'origin', tagName])

  const commitSha = runGit(['rev-parse', 'HEAD'])

  console.log(`Created and pushed annotated release tag ${tagName}`)
  console.log(`Tagged commit SHA: ${commitSha}`)
  console.log('Next steps:')
  console.log('- Wait for the release tag CI workflow to complete for this tag')
  console.log(`- Deploy using commit ${commitSha} (resolved from ${tagName}) after green checks`)
  console.log('- Confirm production deployment and only then move released issues to status:done')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
