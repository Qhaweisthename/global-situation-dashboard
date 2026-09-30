/*
 * Evidence script for Task 1.
 * Sends the SAME question + SAME fixed dashboard snapshot to each model N times
 * and reports whether the answers are identical.
 *
 * Usage (with Ollama, the AI server and the R3 service running):
 *   node scripts/consistency_test.mjs
 *   node scripts/consistency_test.mjs "What is the strongest earthquake?" 5
 */
import { writeFileSync } from 'fs'

const API = process.env.API || 'http://localhost:5050/api/assistant'
const QUESTION = process.argv[2] || 'What is the strongest earthquake right now and where is it?'
const RUNS = Number(process.argv[3] || 3)

// Frozen snapshot so the live feeds cannot change between runs
const dashboard = {
  globalRiskLevel: 'ELEVATED',
  globalRiskScore: 58,
  topThreat: { title: 'CVE-2026-1234', type: 'Cyber Alert', details: 'Known Exploited Vulnerability in VPN gateway' },
  correlatedThreats: [],
  dashboardStats: { earthquakes: 3, volcanoes: 2, aircraft: 2, vessels: 1 },
  feedHealth: { Earthquakes: 'ONLINE', Volcanoes: 'ONLINE', 'CVE Feed': 'ONLINE', Aircraft: 'OFFLINE' },
  earthquakes: [
    { title: 'M 6.1 - 45 km SW of Hualien City, Taiwan', magnitude: 6.1, depth: 12, time: '2026-09-30T04:12:00Z' },
    { title: 'M 4.8 - Kermadec Islands region', magnitude: 4.8, depth: 35, time: '2026-09-30T02:40:00Z' },
    { title: 'M 3.2 - 10 km N of Ridgecrest, CA', magnitude: 3.2, depth: 8, time: '2026-09-30T01:05:00Z' }
  ],
  volcanoes: [
    { title: 'Etna Volcano, Italy', time: '2026-09-28' },
    { title: 'Kilauea Volcano, Hawaii', time: '2026-09-27' }
  ],
  cves: [{ title: 'CVE-2026-1234', details: 'CVSS 9.8 remote code execution in VPN gateway' }],
  kevAlerts: [{ title: 'CVE-2026-1234', location: 'ExampleVendor', time: '2026-09-29' }],
  aircraft: [{ title: 'SAA234', location: 'South Africa', details: 'Altitude 10 668 m' }],
  maritime: [{ title: 'MSC Durban Star', type: 'Cargo', location: 'Port of Durban' }]
}

const results = {}

for (const mode of ['deterministic', 'probabilistic', 'r3']) {
  const answers = []
  console.log(`\n=== ${mode} (${RUNS} runs) ===`)

  for (let i = 0; i < RUNS; i++) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: QUESTION, dashboard, mode })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      answers.push(data.answer)
      const extra = data.routing ? ` skill=${data.routing.selectedSkill}` : ''
      console.log(`  run ${i + 1}: seed=${data.options?.seed} ${data.latencyMs}ms${extra}`)
      console.log(`    "${data.answer.slice(0, 110).replace(/\n/g, ' ')}..."`)
    } catch (e) {
      console.log(`  run ${i + 1}: FAILED - ${e.message}`)
    }
  }

  const unique = new Set(answers).size
  results[mode] = { runs: answers.length, uniqueAnswers: unique, identical: answers.length > 0 && unique === 1, answers }
  console.log(`  -> ${unique} unique answer(s) out of ${answers.length}: ${unique === 1 ? 'IDENTICAL' : 'DIFFERENT'}`)
}

writeFileSync('consistency_results.json', JSON.stringify({ question: QUESTION, results }, null, 2))
console.log('\nSaved full answers to consistency_results.json')
