// @ts-check
/**
 * Parses the Playwright JSON report and posts/updates a summary comment on the PR.
 *
 * Expected env / injected vars:
 *   - github, context (from actions/github-script)
 *   - process.env.E2E_OUTCOME  — outcome of the "e2e" step
 *   - process.env.RUN_URL      — full URL to the workflow run
 */
module.exports = async ({ github, context }) => {
  const fs = require('fs')
  const reportPath = 'e2e/playwright-report/results.json'

  const e2eOutcome = process.env.E2E_OUTCOME || 'unknown'
  const runUrl = process.env.RUN_URL || ''

  let body = ''

  if (!fs.existsSync(reportPath)) {
    body = `### Playwright E2E — ❌ No results\n\nThe test run did not produce a JSON report. Check the [workflow logs](${runUrl}).`
  } else {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

    const projects = {}
    let totalPassed = 0
    let totalFailed = 0
    let totalSkipped = 0
    let totalTests = 0

    for (const suite of report.suites || []) {
      ;(function walk(s) {
        for (const spec of s.specs || []) {
          for (const test of spec.tests || []) {
            const proj = test.projectName || 'default'
            if (!projects[proj])
              projects[proj] = { passed: 0, failed: 0, skipped: 0, total: 0, failedTests: [] }
            for (const result of test.results || []) {
              projects[proj].total++
              totalTests++
              if (result.status === 'passed' || result.status === 'expected') {
                projects[proj].passed++
                totalPassed++
              } else if (result.status === 'skipped') {
                projects[proj].skipped++
                totalSkipped++
              } else {
                projects[proj].failed++
                totalFailed++
                projects[proj].failedTests.push(
                  `\`[${proj}] ${spec.file}:${spec.line}\` — ${spec.title}`,
                )
              }
            }
          }
        }
        for (const child of s.suites || []) walk(child)
      })(suite)
    }

    const duration = report.stats?.duration ? `${Math.round(report.stats.duration / 1000)}s` : 'N/A'

    const icon = totalFailed > 0 ? '❌' : '✅'
    const summary =
      totalFailed > 0
        ? `${totalPassed}/${totalTests} passed, ${totalFailed} failed in ${duration}`
        : `${totalPassed}/${totalTests} passed in ${duration}`

    body = `### Playwright E2E — ${icon} ${summary}\n\n`

    if (totalFailed > 0) {
      body += `**Failed tests:**\n`
      for (const [, proj] of Object.entries(projects)) {
        for (const ft of proj.failedTests) {
          body += `- ${ft}\n`
        }
      }
      body += '\n'
    }

    const details = Object.entries(projects)
      .map(
        ([name, p]) =>
          `- **${name}**: ${p.passed}/${p.total}${p.skipped ? ` (${p.skipped} skipped)` : ''}`,
      )
      .join('\n')

    body += `<details>\n<summary>Details by project</summary>\n\n${details}\n</details>\n\n`
    body += `[View full report](${runUrl})`
  }

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  })
  const marker = '### Playwright E2E'
  const existing = comments.find((c) => c.body?.startsWith(marker))

  if (existing) {
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existing.id,
      body,
    })
  } else {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body,
    })
  }
}
