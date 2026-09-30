/* global process */
import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/*
 * Local AI server for the Global Situation Dashboard.
 *
 *   Model A (deterministic)  llama3.1 via Ollama, greedy decoding:
 *                            temperature 0, top_k 1, fixed seed 42
 *   Model B (probabilistic)  llama3.1 via Ollama, sampling:
 *                            temperature 0.9, top_p 0.95, top_k 40, new random seed per call
 *   Model C (Tencent R3)     R3-Embedding + R3-Rerank (Python service on :5055) route the
 *                            question to one dashboard skill, then Model A's deterministic
 *                            settings answer using only that skill's slice of data
 *
 * Everything runs on localhost. No cloud AI APIs are called.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILLS = JSON.parse(
  readFileSync(path.join(__dirname, 'skills', 'dashboard_skills.json'), 'utf-8')
)

const PORT = Number(process.env.PORT || 5050)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1'
const R3_URL = process.env.R3_URL || 'http://127.0.0.1:5055'

// num_ctx is raised from Ollama's small default so the dashboard JSON is not silently truncated
const DETERMINISTIC_OPTIONS = { temperature: 0, top_k: 1, top_p: 1, seed: 42, num_ctx: 8192 }
const PROBABILISTIC_OPTIONS = { temperature: 0.9, top_k: 40, top_p: 0.95, num_ctx: 8192 }

const MODELS = {
  deterministic: 'Model A — Deterministic (greedy decoding)',
  probabilistic: 'Model B — Probabilistic (temperature sampling)',
  r3: 'Model C — Tencent R3-Skill router + deterministic LLM'
}

const SYSTEM_PROMPT = `
You are an intelligence dashboard assistant.

You answer only from the dashboard data provided.
Do not invent information.
If something is not visible in the dashboard data, say that it is not currently shown.

Keep answers clear, useful, and analyst-style.

When asked for a summary, include:
- Global risk level
- Top threat
- Correlated threats
- Major cyber activity
- Major disaster activity
- Air and maritime activity
`

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Defensive clean-up in case display objects slip through from the browser
function cleanData(dashboard) {
  return JSON.parse(JSON.stringify(dashboard, (key, val) => (key.startsWith('__') ? undefined : val)))
}

// Data first, question LAST: if a prompt is ever too long, Ollama trims the start,
// so the question and instructions at the end are never the part that gets lost
function buildUserPrompt(question, dashboard) {
  const data = JSON.stringify(cleanData(dashboard))
  const approxTokens = Math.round(data.length / 4)
  if (approxTokens > 6000) {
    console.warn(`Warning: dashboard data is ~${approxTokens} tokens and may exceed the context window`)
  }
  return `
Dashboard Data (JSON):
${data}

Answer using ONLY the dashboard data above. If the data does not contain what is needed, say it is not currently shown.

Question:
${question}
`
}

async function callOllama(system, user, options) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      options
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  return data.message?.content || 'No response from local AI.'
}

async function routeWithR3(question) {
  const response = await fetch(`${R3_URL}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question, top_k: 3 })
  })

  if (!response.ok) {
    throw new Error(`R3 service returned ${response.status}: ${await response.text()}`)
  }

  return response.json()
}

// Only send the dashboard fields the routed skill needs (smaller, more focused prompt)
function pickData(dashboard, keys) {
  const slice = {
    globalRiskLevel: dashboard.globalRiskLevel,
    globalRiskScore: dashboard.globalRiskScore
  }
  for (const key of keys) {
    if (dashboard[key] !== undefined) slice[key] = dashboard[key]
  }
  return slice
}

app.get('/api/health', async (req, res) => {
  const status = { server: 'OK', ollama: 'DOWN', r3: 'DOWN', llm: OLLAMA_MODEL }

  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`)
    if (r.ok) status.ollama = 'OK'
  } catch { /* Ollama not running */ }

  try {
    const r = await fetch(`${R3_URL}/health`)
    if (r.ok) status.r3 = 'OK'
  } catch { /* R3 service not running */ }

  res.json({ status: 'OK', message: 'Local AI server is running', models: MODELS, ...status })
})

app.post('/api/assistant', async (req, res) => {
  const { question, dashboard, mode = 'deterministic' } = req.body || {}

  if (!question || !dashboard) {
    return res.status(400).json({ error: 'Missing question or dashboard data' })
  }
  if (!MODELS[mode]) {
    return res.status(400).json({ error: `Unknown mode "${mode}". Use: ${Object.keys(MODELS).join(', ')}` })
  }

  const started = Date.now()

  try {
    let answer
    let options
    let routing = null

    if (mode === 'deterministic') {
      options = DETERMINISTIC_OPTIONS
      answer = await callOllama(SYSTEM_PROMPT, buildUserPrompt(question, dashboard), options)
    }

    if (mode === 'probabilistic') {
      // A fresh random seed each call is the source of run-to-run variation
      options = { ...PROBABILISTIC_OPTIONS, seed: Math.floor(Math.random() * 2 ** 31) }
      answer = await callOllama(SYSTEM_PROMPT, buildUserPrompt(question, dashboard), options)
    }

    if (mode === 'r3') {
      const r3 = await routeWithR3(question)
      const best = r3.results?.[0]
      const skill = SKILLS.find(s => s.id === best?.id) || SKILLS[0]

      const system = `${SYSTEM_PROMPT}
Active skill: ${skill.id}
Skill focus: ${skill.description}
Skill instructions: ${skill.instructions}
`
      options = DETERMINISTIC_OPTIONS
      answer = await callOllama(system, buildUserPrompt(question, pickData(dashboard, skill.dataKeys)), options)

      routing = {
        selectedSkill: skill.id,
        dataSent: ['globalRiskLevel', 'globalRiskScore', ...skill.dataKeys],
        candidates: r3.results,
        timingsMs: r3.timings_ms
      }
    }

    res.json({
      answer,
      mode,
      model: MODELS[mode],
      llm: OLLAMA_MODEL,
      options,
      routing,
      latencyMs: Date.now() - started
    })
  } catch (error) {
    console.error(error)
    const hint = mode === 'r3'
      ? 'Is the R3 service running (python r3_service/app.py) and Ollama running?'
      : 'Is Ollama running (ollama serve) with llama3.1 pulled?'
    res.status(500).json({ error: `Local AI (${MODELS[mode]}) failed: ${error.message}. ${hint}` })
  }
})

app.listen(PORT, () => {
  console.log(`Local AI assistant running on http://localhost:${PORT}`)
  console.log(`  Ollama: ${OLLAMA_URL} (${OLLAMA_MODEL})`)
  console.log(`  R3-Skill router: ${R3_URL}`)
})
