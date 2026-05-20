# GitHub Issues Workflow

GitHub Issues is the canonical source of truth for active work items in
Jobflow.

Legacy work item documents remain in the repository as read-only historical
context:

- `docs/feature-bank.md`
- `docs/refactor-bank.md`
- `docs/fix-bank.md`
- `docs/workitems/`
- `docs/roadmap.active.md`

Do not use those legacy files for new intake, active planning, status tracking,
or implementation handoff unless the Product Owner explicitly asks for archival
work.

Use `docs/github-issue-migration-map.md` only as a transition aid when you need
to translate old `FEAT-XXX`, `REF-XXX`, or `FIX-XXX` references into GitHub
issue numbers.

## Active Workflow

```text
intake -> GitHub issue -> planning in issue body -> branch -> implementation -> checks -> commit -> PR -> squash merge to main -> issue status: released -> confirmed release -> issue status: done and close
```

## Naming Policy

Issue title:

- `[type][scope1,scope2] Human-readable title`
- Example:
  `[fix][home,mobile] Main page table is unusable on mobile`

Branch:

- `type/<issue-number>-short-description`
- Example:
  `fix/123-home-mobile-table`

Commit and PR title:

- `type(scope1,scope2): message (#issue-number)`
- Example:
  `fix(home,mobile): make main page table usable on mobile (#123)`

Types:

- `feat`
- `fix`
- `ref`

## Required Labels

Type:

- `type:feat`
- `type:fix`
- `type:ref`

Status:

- `status:new`
- `status:triage`
- `status:discovery`
- `status:planned`
- `status:in_progress`
- `status:in_review`
- `status:released`
- `status:done`
- `status:cancelled`

Priority:

- `priority:high`
- `priority:medium`
- `priority:low`

## Required Issue Body Sections

- `Summary`
- `Goals`
- `Scope`
- `Non-Goals`
- `Affected Areas`
- `Acceptance Criteria`
- `Risks`
- `Verification`

Planning updates the issue body. Implementation reads from the issue body.

## Automation

Sync labels:

```bash
pnpm github:labels:sync
```

Create a new issue from the CLI:

```bash
pnpm github:issue:new -- \
  --type fix \
  --scopes home,mobile \
  --title "Main page table is unusable on mobile" \
  --priority high \
  --summary "The main table does not fit on mobile screens."
```

Update issue status:

```bash
pnpm github:issue:status -- --issue 123 --status released
pnpm github:issue:status -- --issue 123 --status done --comment "Confirmed released to production."
```

Migrate legacy open work items:

```bash
pnpm github:issues:migrate-legacy
```

Use `--dry-run` first if you want to preview the migration:

```bash
pnpm github:issues:migrate-legacy -- --dry-run
```

## Release Rule

Do not rely on automatic issue closing keywords if a task becomes truly done
only after confirmed release.

After merge:

- set issue label to `status:released`

After confirmed production release:

- set issue label to `status:done`
- close the issue
