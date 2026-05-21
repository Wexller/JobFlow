## Summary

## Linked Issue

Issue: #<number>

## Type And Scopes

- Type: feat | fix | ref
- Scopes:

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] Focused tests appropriate for the change
- [ ] Additional verification notes captured below

## Notes

- Create implementation branches from the issue with
  `gh issue develop <issue-number> --name type/<issue-number>-short-description --base main --checkout`
  so GitHub links the branch and PR in the issue's `Development` section.
- Use `Issue: #<number>` as the only PR body issue reference.
- Do not use automatic closing keywords like `Closes #123`, `Fixes #123`, or
  `Resolves #123` because they bypass the `released -> done` workflow.
- After merge, move the issue to `status:released`. Close it only after
  confirmed production release.
