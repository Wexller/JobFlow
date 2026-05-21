#!/usr/bin/env node

const minimumMajor = 22
const detectedVersion = process.version
const detectedMajor = Number.parseInt(detectedVersion.slice(1).split('.')[0] ?? '', 10)
const detectedPath = process.execPath

if (Number.isNaN(detectedMajor) || detectedMajor < minimumMajor) {
  console.error(
    [
      `Jobflow requires Node.js ${minimumMajor}+ but detected ${detectedVersion}.`,
      `Resolved node binary: ${detectedPath}`,
      'If you use nvm, run `nvm use` in the repository before running pnpm commands.',
      'On macOS login shells, `/usr/local/bin/node` may override the repository version because of `path_helper`.',
    ].join('\n'),
  )

  process.exit(1)
}
