/*
 * Task 2: runs the standard question set against all three local models.
 *
 * Usage:
 *   node scripts/standard_questions.mjs task2-snapshot-XXXX.json   (replay data exported from the dashboard)
 *   node scripts/standard_questions.mjs task2-snapshot-XXXX.json 3 (3 runs per model instead of 2)
 *
 * Writes task2-results.md and task2-results.json in the project folder.
 */
import { readFileSync, writeFileSync } from 'fs'

const API = process.env.API || 'http://localhost:5050/api/assistant'
const snapshotPath = process.argv[2]
const RUNS = Number(process.argv[3] || 2)

if (!snapshotPath) {
  console.error('Give a snapshot file: use "Download data snapshot (JSON)" in the dashboard first.')
  process.exit(1)
}

const dashboard = JSON.parse(readFileSync(snapshotPath, 'utf-8'))

const QUESTIONS = [
  'Is there significant seismic activity right now, based on the current data?',
  'Which region currently shows the highest overall risk?',
  "Summarise today's cybersecurity threat level in one sentence.",
  'Is volcanic activity trending up or down this week?',
  'Give one recommendation based on current global risk levels.',
  'How confident are you in this assessment, and why?'
]
const MODES = { deterministic: 'Model A (Deterministic)', probabilistic: 'Model B (Probabilistic)', r3: 'Model C (Tencent R3-Skill)' }

const results = []
const total = QUESTIONS.length * Object.keys(MODES).length * RUNS
let done = 0

for (const [qIndex, question] of QUESTIONS.entries()) {
  for (const mode of Object.keys(MODES)) {
    const runs = []
    for (let run = 1; run <= RUNS; run++) {
      done++
      process.stdout.write(`[${done}/${total}] Q${qIndex + 1} ${MODES[mode]} run ${run} ... `)
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, dashboard, mode })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        runs.push({ answer: data.answer, seed: data.options?.seed, skill: data.routing?.selectedSkill, latencyMs: data.latencyMs })
        console.log(`${data.latencyMs} ms`)
      } catch (e) {
        runs.push({ answer: `ERROR: ${e.message}` })
        console.log('FAILED')
      }
    }
    results.push({ qIndex, question, mode, runs, identical: runs.every(r => r.answer === runs[0].answer) })
  }
}

const md = [
  '# Task 2: Standard question set results', '',
  `Snapshot: ${snapshotPath} (captured ${dashboard.capturedAt || 'unknown'})`,
  `Global risk at capture: ${dashboard.globalRiskLevel} (score ${dashboard.globalRiskScore})`,
  `Runs per model per question: ${RUNS}`, '',
  '| Question | Model A | Model B | Model C |', '| --- | --- | --- | --- |',
  ...QUESTIONS.map((q, i) => {
    const cell = m => (results.find(r => r.qIndex === i && r.mode === m)?.identical ? 'Identical' : 'Different')
    return `| Q${i + 1} | ${cell('deterministic')} | ${cell('probabilistic')} | ${cell('r3')} |`
  })
]
for (const [i, q] of QUESTIONS.entries()) {
  md.push('', `## Q${i + 1}. ${q}`)
  for (const r of results.filter(x => x.qIndex === i)) {
    md.push('', `### ${MODES[r.mode]} (${r.identical ? 'identical across runs' : 'differs across runs'})`)
    r.runs.forEach((run, n) => {
      const extra = [run.seed !== undefined && `seed ${run.seed}`, run.skill && `skill ${run.skill}`, run.latencyMs && `${run.latencyMs} ms`].filter(Boolean).join(', ')
      md.push('', `**Run ${n + 1}** (${extra})`, '', run.answer)
    })
  }
}

writeFileSync('task2-results.md', md.join('\n'))
writeFileSync('task2-results.json', JSON.stringify({ snapshot: snapshotPath, results }, null, 2))
console.log('\nSaved task2-results.md and task2-results.json')
