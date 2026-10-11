import { buildRequestBody } from './brain'

const KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-lite-latest'
const FALLBACK = import.meta.env.VITE_GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite'

export const geminiConfigured = Boolean(KEY)
export const modelName = MODEL

async function call(model, text, state, thinking) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 9000)
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': KEY },
      body: JSON.stringify(buildRequestBody(text, state, { thinking })),
      signal: ctrl.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data?.error?.message || `Gemini HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    const raw = data?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text
    if (!raw) throw new Error('Gemini returned no content')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.actions)) throw new Error('Gemini returned no actions')
    return parsed.actions
  } finally {
    clearTimeout(timer)
  }
}

// Race two fast models in parallel and take whichever answers first; retry once with a third.
const timed = (model, thinking, text, state, t0) =>
  call(model, text, state, thinking).then((actions) => ({ actions, model, ms: Math.round(performance.now() - t0) }))

export async function parseWithGemini(text, state) {
  const t0 = performance.now()
  const rounds = [
    [[MODEL, !MODEL.includes('latest')], [FALLBACK, true]],
    [['gemini-3.1-flash-lite', false], [FALLBACK, false]],
  ]
  let lastErr
  for (const round of rounds) {
    try {
      const result = await Promise.any(round.map(([model, thinking]) => timed(model, thinking, text, state, t0)))
      console.groupCollapsed(`%c[yap] ${result.model} · ${result.ms}ms · ${result.actions.length} actions`, 'color:#fb923c')
      console.log('said:', text)
      console.table(result.actions)
      console.groupEnd()
      return result
    } catch (err) {
      lastErr = err.errors?.[0] || err
      console.warn('[yap] gemini round failed:', (err.errors || [err]).map((e) => e.message).join(' | '))
    }
  }
  throw lastErr
}
