# Swappable site releases

The live GitHub Pages site can be changed without editing code or using an AI.
Each approved homepage is stored on a permanent `release/*` branch. The Pages
workflow supports `workflow_dispatch`, so an owner can deploy a branch from the
GitHub Actions interface.

## Local release branches

| Branch | Homepage |
| --- | --- |
| `main` | Working development line; pushes deploy automatically |
| `release/current-scroll` | Current endless market story |
| `release/previous-scroll` | Preserved earlier endless market story |
| `release/datum-rail` | Survey-coordinate navigation study |
| `release/plan-legend` | Architectural plan-legend navigation study |
| `release/compass` | Compass navigation study |
| `release/sheet-tabs` | Drawing-set tab navigation study |

## Publish the repository and every release

After configuring `origin`, push the development line and all release branches:

```bash
git push -u origin main
git push origin 'release/*'
```

If the shell does not pass the quoted branch pattern through to Git, use:

```bash
git push origin --all
```

Do not force-push these branches.

## Change the live version in GitHub

1. Open **Actions** in `josemanuelmojica/josemanuelmojica.github.io`.
2. Choose **Deploy static export to GitHub Pages**.
3. Choose **Run workflow**.
4. Select the desired `release/*` branch.
5. Run the workflow and wait for the `deploy` job to finish.

To return to the newest development version, run the same workflow from `main`.
A later push to `main` will also deploy `main` automatically.

## Verify what is live

The workflow builds from the selected branch, runs that branch's source and
static-export contracts, then publishes `out/`. Check the workflow's deployment
URL and confirm the release label in `content/release.json` on the selected
branch. GitHub Pages has only one live deployment at a time; the other branches
remain available as rollback points.

## Updating a release without AI

Make changes on a normal working branch, test them with `npm test`, merge them to
`main`, then deliberately move or recreate an approved release branch. Avoid
rewriting an existing release unless the replacement has been reviewed. A new
name such as `release/current-scroll-v2` preserves the older rollback point.
