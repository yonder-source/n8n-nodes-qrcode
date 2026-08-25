# Contributing

Thank you for contributing to `@yonder-source/n8n-nodes-qrcode`.

## Before you start

- Check existing issues and pull requests before starting substantial work.
- For a bug, include a reproducible example or workflow when possible.
- For a new feature or behavior change, open an issue first when the change
  affects the node contract, published package, or n8n compatibility.
- Describe the intended node contract and acceptance criteria before coding.
- Keep changes focused. Do not include unrelated formatting, dependency, or
  workflow changes.

## Local development

Requirements:

- Node.js 22.22 or newer
- npm

Install dependencies and run the project checks:

```sh
npm install
npm test
npm run lint
npm run build
npm pack --dry-run
```

Use `npm run dev` to run n8n with the node available for manual testing. Run
`npm run lint:fix` only when you have reviewed the resulting changes.

Use `npm ci` for a clean, lockfile-only installation when verifying a pull
request or reproducing a CI environment.

## Code and node behavior

- Follow the repository instructions in `AGENTS.md` and the relevant guidance
  under `.agents/`.
- Preserve input JSON and existing binary data unless the requested behavior
  explicitly changes them.
- Keep the node dependency-free at runtime; development-only dependencies must
  not be bundled into the published node.
- Add or update tests for behavior changes, including error and
  `continueOnFail` paths where applicable.
- Do not edit user-maintained workflow or external platform configuration as
  part of an unrelated code change.
- Preserve license and attribution notices in vendored source.
- Do not add credentials, tokens, generated secrets, or local n8n data to the
  repository.

## Pull requests

Use a focused branch based on `main` and a Conventional Commit message, for
example:

```text
feat: add QR output option
fix: preserve source item links on errors
chore: sync lockfile
```

Pull requests should include:

- A concise description of the change and its user-visible impact.
- Relevant automated tests and manual verification details.
- Any compatibility, migration, or release considerations.
- Confirmation that unrelated files and generated output were not changed.

Keep generated output and lockfile changes limited to what the change requires.
Maintainers may request changes before merging.

Before requesting review, confirm:

```sh
npm test
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

## Reporting issues

Include the package version, Node.js and n8n versions, reproduction steps, and
the smallest useful workflow or payload. Remove credentials and other sensitive
data before sharing logs or workflow exports.
