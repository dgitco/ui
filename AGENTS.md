# DGit UI — agent rules

## Development rules (shared, 2026-10-15)

- **Squash merge only.** The PR title becomes the commit title on main, the PR body its message.
- **Update a branch with `git rebase origin/main`, then `git push --force-with-lease`.** Never merge main into a branch.
- **main is protected.** No direct pushes, force pushes or deletion, and no admin bypass merges. Every change goes through a PR.
- **PR body: Background · Change · Screens (before/after) · Risk** ([template](.github/pull_request_template.md)). If the UI changes, attach before/after images (video for motion). **A UI change without images is not merged.** No UI change: "N/A — why".
- Upload images and videos with `shot-upload <file>` (public R2 bucket `pr-shots`; prints the URL and markdown). Where it isn't installed, drag the file into the PR editor. Links are public: use fake data or blur anything personal.
- **Dependent changes go in a stack with `gh stack`** (`gh stack init` → `gh stack add` → `gh stack submit`). One thing per layer; split when the non-test diff passes about 400 lines.
- **Tests cover API contracts, permission boundaries, money/date calculations and migrations only.** No tests that pin CSS classes, copy, layout, or jsdom viewports. Tests that need a database: tenant isolation and money only.
- **Merge condition: a review pass by an agent other than the one that wrote the PR, plus evidence.** The reviewer (e.g. a subagent that doesn't know the writing conversation) checks correctness, requirements and evidence only; trivial findings are not acted on. No waiting for human approval.
