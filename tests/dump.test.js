import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('Brain Dump panel structure', async (t) => {
  const dumpPath = path.resolve('src/sections/DumpPanel.jsx')
  const content = fs.readFileSync(dumpPath, 'utf8')

  await t.test('does not contain upcoming radar column or state filter', () => {
    assert.strictEqual(content.includes('Upcoming Radar'), false)
    assert.strictEqual(content.includes('const upcoming ='), false)
    assert.strictEqual(content.includes('No upcoming future tasks'), false)
  })

  await t.test('organizes content into Ideas and Someday 2-column layout', () => {
    assert.ok(content.includes('Bento Column 1: Ideas'))
    assert.ok(content.includes('Bento Column 2: Someday Backlog'))
    assert.ok(content.includes('md:grid-cols-2'))
  })
})
