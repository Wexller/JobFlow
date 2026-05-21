# Codex Implementation Spec: Tag-Based Releases And CI

Status: proposed
Date: 2026-05-21
Owner: Codex

## Summary

Replace the current persistent `release/<SemVer>` branch workflow with a
tag-only release workflow based on annotated tags `v<SemVer>`.

At the same time, add repository CI so that:

- pull requests and pushes to `main` run the required quality gates;
- pushing a release tag `v<SemVer>` runs a dedicated release verification
  workflow on the tagged commit;
- production release evidence is anchored to the tag name and its commit SHA,
  not to a long-lived release branch;
- GitHub Release objects are not used in v1 of this change.

This document is intended to be implementation-ready for a Codex execution
task.

## Product Decision

- The single release source of truth is an annotated git tag `v<SemVer>`.
- Production deploys must use the commit referenced by the tag.
- Release evidence must reference:
  - the tag name;
  - the commit SHA behind the tag;
  - the CI run that validated the tagged commit;
  - the deploy/build record created from that SHA.
- Do not create or maintain persistent `release/<SemVer>` branches.
- Do not create GitHub Release entries in this scope.

## Goals

- Simplify the release model to one immutable release ref per version.
- Make CI the default quality gate for `main` and release tags.
- Keep the release workflow auditable and repeatable without long-lived release
  branches.
- Preserve the existing issue lifecycle:
  merged work items become `status:released`, and move to `status:done` only
  after confirmed production deployment.

## Non-Goals

- Automatic production deployment.
- Changelog generation or release notes publishing.
- Pre-release tag formats such as `-rc.1` or `-beta`.
- Reworking the issue/PR workflow.
- Replacing the current test commands with a new verification stack.

## Current Repository Facts

- The repository currently defines `pnpm release:branch` in `package.json`.
- The script `scripts/release/create-release-branch.mjs` creates and pushes
  `release/<SemVer>` from `main`.
- `README.md`, `AGENTS.md`, `docs/agents/operating-model.md`,
  `docs/operations/postgres-production-deploy.md`, and
  `docs/release/mvp-readiness-notes.md` all describe release branches as the
  current release record.
- The repository already has a suitable local quality gate:
  `pnpm test:ci`.
- The repository currently has no committed GitHub Actions workflow files for
  CI or release verification.

## Required Changes

## 1. Release Contract

Update the documented release flow everywhere from:

```text
main -> release/<SemVer> -> release checks -> build/deploy from release branch
```

to:

```text
main -> annotated tag v<SemVer> -> release checks on tagged commit -> build/deploy from tag SHA
```

Required policy updates:

- The canonical release identifier is `v<SemVer>`.
- Tags must be annotated tags, not lightweight tags.
- Re-tagging an existing version is forbidden.
- Rollback uses a previously validated release tag.
- A hotfix still follows the normal issue branch -> PR -> merge to `main` flow,
  followed by a new version tag.

## 2. CLI And Release Script

Replace the release branch helper with a tag helper.

### Package script changes

- Remove `release:branch` from `package.json`.
- Add `release:tag`:
  - `node scripts/release/create-release-tag.mjs`

### New script

Create `scripts/release/create-release-tag.mjs` with the following behavior:

- Accept `--version <SemVer>`.
- Require a clean worktree.
- Validate strict `x.y.z` format.
- Fetch `origin/main` and tags before validation.
- Ensure the current local `main` is fast-forwarded to `origin/main`.
- Ensure local branch is `main` before creating the tag.
- Ensure tag `v<SemVer>` does not already exist locally or on `origin`.
- Create an annotated tag `v<SemVer>` on the current `main` commit.
- Push the tag to `origin`.
- Print next steps:
  - wait for tag CI workflow;
  - deploy from the tag SHA after green checks;
  - confirm production deployment and only then close issues as `done`.

### Legacy script handling

- Remove `scripts/release/create-release-branch.mjs`, or keep a minimal stub
  that exits with a clear deprecation error pointing to `pnpm release:tag`.
- The repository must not retain a documented happy path that still mentions
  `release/<SemVer>`.

## 3. GitHub Actions CI

Add two workflows.

### Workflow A: `.github/workflows/ci.yml`

Purpose:

- validate all pull requests;
- validate direct pushes to `main`.

Triggers:

- `pull_request`
- `push` on `main`

Concurrency:

- cancel in-progress runs for the same branch or PR ref.

Permissions:

- use the minimum default read permissions only.

Shared setup for all jobs:

- `actions/checkout@v4`
- `pnpm/action-setup@v4`
- `actions/setup-node@v4` with Node `22`
- pnpm cache enabled
- `pnpm install --frozen-lockfile`

Jobs:

1. `verify`
- Run:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm prisma:validate`
  - `pnpm prisma:generate`
  - `pnpm test:unit`
  - `pnpm test:nuxt`
  - `pnpm build`

2. `postgres`
- Run on `ubuntu-latest`.
- Use the existing repository commands rather than inventing new CI-only DB
  orchestration.
- Run:
  - `pnpm db:test:up:compose`
  - `JOBFLOW_DATABASE_URL="$(pnpm -s db:test:url)" pnpm db:check`
  - `pnpm db:test:down:compose`
- Ensure the database shutdown step still runs when verification fails.

3. `e2e`
- Install Playwright browser and Linux dependencies:
  - `pnpm exec playwright install --with-deps chromium`
- Run:
  - `pnpm test:e2e`

Required result:

- all three jobs must pass before a PR is considered merge-ready.

### Workflow B: `.github/workflows/release-tag.yml`

Purpose:

- validate release tags `v<SemVer>`;
- produce immutable release evidence tied to the tag and commit SHA.

Trigger:

- `push` on tags matching `v*`

Concurrency:

- one run per tag ref, without canceling completed tag runs.

Permissions:

- default read permissions only.

Jobs:

1. `validate-tag`
- Confirm `github.ref` matches `refs/tags/v<SemVer>`.
- Resolve and print:
  - tag name;
  - target commit SHA.
- Fail if the tag format is invalid.
- Fetch `origin/main` and fail if the tagged commit is not reachable from
  `origin/main`.

2. `verify`
- Same commands as `ci.yml` job `verify`, but on the tagged commit.

3. `postgres`
- Same commands as `ci.yml` job `postgres`, but on the tagged commit.

4. `e2e`
- Same commands as `ci.yml` job `e2e`, but on the tagged commit.

5. `release-evidence`
- Depends on all previous jobs.
- Generate a small artifact file, for example `release-evidence.json`,
  containing:
  - tag name;
  - commit SHA;
  - workflow run URL;
  - UTC timestamp;
  - result summary.
- Upload the artifact so the run acts as a durable release verification record.

Important:

- This workflow does not deploy.
- This workflow does not create a GitHub Release entry.
- Deployment remains a manual or future-environment step, but it must consume
  the validated tagged commit SHA.

## 4. Documentation Updates

Update these files so they describe the new tag-only release model and CI:

- `AGENTS.md`
- `README.md`
- `docs/agents/operating-model.md`
- `docs/operations/postgres-production-deploy.md`
- `docs/release/mvp-readiness-notes.md`

Required documentation changes:

- replace `pnpm release:branch -- --version <SemVer>` with
  `pnpm release:tag -- --version <SemVer>`;
- remove instructions to build/deploy from `release/<SemVer>`;
- define the release record as tag + SHA + CI run + deploy/build record;
- explain that GitHub Release entries are intentionally not used in this
  version of the process;
- update rollback guidance to refer to previous release tags;
- update CI guidance to reference the new GitHub Actions workflows.

## 5. Repository Settings Follow-Up

Document, but do not attempt to automate inside the repository:

- branch protection for `main`;
- required status checks for:
  - `verify`
  - `postgres`
  - `e2e`
- restrictions so production deploy operators use validated tags rather than
  arbitrary branch heads.

If the implementation creates different job names, the documentation must be
updated to match the exact workflow job names.

## File-Level Change List

Add:

- `.github/workflows/ci.yml`
- `.github/workflows/release-tag.yml`
- `docs/release/tag-based-release-ci-spec.md`
- `scripts/release/create-release-tag.mjs`

Update:

- `AGENTS.md`
- `README.md`
- `package.json`
- `docs/agents/operating-model.md`
- `docs/operations/postgres-production-deploy.md`
- `docs/release/mvp-readiness-notes.md`

Remove or deprecate:

- `scripts/release/create-release-branch.mjs`

## Acceptance Criteria

- The repository has no documented primary release path based on
  `release/<SemVer>`.
- `pnpm release:tag -- --version 1.2.3` is the documented release entrypoint.
- PRs and pushes to `main` run CI in GitHub Actions.
- Pushing `v1.2.3` runs a dedicated tag verification workflow.
- Release verification records include the tag and commit SHA.
- No GitHub Release object is required for a successful release.
- Rollback guidance references prior tags instead of release branches.
- The updated README remains accurate and in English.

## Verification Plan

Implementation verification must include:

1. Local script checks
- create a temporary version tag in a safe test repository or dry-run-style
  validation path if implemented;
- verify failures for:
  - dirty worktree;
  - invalid version;
  - existing local tag;
  - existing remote tag;
  - local `main` not aligned with `origin/main`.

2. Workflow validation
- validate GitHub Actions YAML syntax;
- confirm expected triggers:
  - PR to `main`
  - push to `main`
  - push tag `v<SemVer>`
- confirm the Postgres job always tears down the test DB stack.

3. Documentation review
- search the repository for `release/<SemVer>` and confirm only historical or
  intentionally deprecated references remain;
- search for `release:branch` and confirm it is removed or clearly deprecated;
- confirm all release instructions use tag-based wording consistently.

## Assumptions

- GitHub-hosted Ubuntu runners can execute the current Docker Compose-based
  Postgres test lane.
- Tag-triggered workflows are acceptable as the release verification anchor.
- Production deployment tooling can consume a commit SHA obtained from the tag.
- Introducing reusable workflows is unnecessary for v1; duplicated workflow
  steps are acceptable if they keep the implementation simpler.
