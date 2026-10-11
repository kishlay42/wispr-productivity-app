import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('Cat widget CSS variables, blink logic, and PetToggle stacking', async (t) => {
  const css = fs.readFileSync(path.resolve('src/index.css'), 'utf8')

  await t.test(':root contains correct light mode cat colors', () => {
    assert.match(css, /--cat-o:\s*#09090b/)
    assert.match(css, /--cat-w:\s*#18181b/)
    assert.match(css, /--cat-p:\s*#f472b6/)
    assert.match(css, /--cat-e:\s*#22c55e/)
    assert.match(css, /--cat-s:\s*#ffffff/)
    assert.match(css, /--cat-n:\s*#fb7185/)
    assert.match(css, /--cat-m:\s*#09090b/)
  })

  await t.test(':root.dark contains correct dark mode cat colors', () => {
    assert.match(css, /--cat-o:\s*#27272a/)
    assert.match(css, /--cat-w:\s*#f8fafc/)
    assert.match(css, /--cat-p:\s*#f472b6/)
    assert.match(css, /--cat-e:\s*#0ea5e9/)
    assert.match(css, /--cat-s:\s*#ffffff/)
    assert.match(css, /--cat-n:\s*#fb7185/)
    assert.match(css, /--cat-m:\s*#71717a/)
  })

  const topBar = fs.readFileSync(path.resolve('src/components/TopBar.jsx'), 'utf8')

  await t.test('TopBar uses CSS variables for CAT_COLORS', () => {
    assert.match(topBar, /O:\s*'var\(--cat-o\)'/)
    assert.match(topBar, /W:\s*'var\(--cat-w\)'/)
    assert.match(topBar, /P:\s*'var\(--cat-p\)'/)
    assert.match(topBar, /E:\s*'var\(--cat-e\)'/)
    assert.match(topBar, /S:\s*'var\(--cat-s\)'/)
    assert.match(topBar, /N:\s*'var\(--cat-n\)'/)
    assert.match(topBar, /M:\s*'var\(--cat-m\)'/)
  })

  await t.test('CAT_CLOSED blink logic replaces [SE] with W on both rows 6 and 7', () => {
    assert.match(topBar, /i === 6 \|\| i === 7/)
  })

  await t.test('TopBar wrapper elevates to z-50 when petMenuOpen is true', () => {
    assert.match(topBar, /petMenuOpen\s*\?\s*'z-50'\s*:\s*'z-20'/)
    assert.match(topBar, /onOpenChange=\{setPetMenuOpen\}/)
  })

  const screenPets = fs.readFileSync(path.resolve('src/components/ScreenPets.jsx'), 'utf8')

  await t.test('PetToggle supports onOpenChange and dropdown card has z-[70]', () => {
    assert.match(screenPets, /onOpenChange/)
    assert.match(screenPets, /z-\[70\]/)
  })
})
