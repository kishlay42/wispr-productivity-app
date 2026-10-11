import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('Interactive cursor styling in index.css', async (t) => {
  const cssPath = path.resolve('src/index.css')
  const css = fs.readFileSync(cssPath, 'utf8')

  await t.test('declares cursor: pointer for buttons and interactive controls under @layer base', () => {
    assert.match(css, /@layer base\s*\{[\s\S]*cursor:\s*pointer[\s\S]*\}/)
  })

  await t.test('includes button, [role="button"], [role="option"], and select selectors', () => {
    assert.match(css, /button:not\(:disabled\)/)
    assert.match(css, /\[role="button"\]/)
    assert.match(css, /\[role="option"\]/)
    assert.match(css, /\[role="tab"\]/)
    assert.match(css, /select:not\(:disabled\)/)
  })

  await t.test('declares cursor: not-allowed for disabled buttons and inputs', () => {
    assert.match(css, /cursor:\s*not-allowed/)
    assert.match(css, /button:disabled/)
    assert.match(css, /input:disabled/)
  })
})
