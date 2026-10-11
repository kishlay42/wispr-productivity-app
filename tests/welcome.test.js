import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  detectOS,
  getOSShortcutDetails,
  getModKey,
  getAppShortcuts,
  cleanSpokenName,
  shouldShowWelcomeGate,
  WELCOME_NAME_STORAGE_KEY,
  WELCOMED_FLAG_STORAGE_KEY,
} from '../src/lib/welcome.js'

describe('WelcomeGate speech & helper functions', () => {
  describe('cleanSpokenName()', () => {
    test('extracts clean name from speech with preamble', () => {
      assert.equal(cleanSpokenName('My name is Sophie'), 'Sophie')
      assert.equal(cleanSpokenName('hello my name is Chihiro'), 'Chihiro')
      assert.equal(cleanSpokenName("I'm Howl Pendragon"), 'Howl Pendragon')
      assert.equal(cleanSpokenName('Call me Totoro'), 'Totoro')
      assert.equal(cleanSpokenName('this is Kiki!'), 'Kiki')
    })

    test('handles direct names and capitalizes appropriately', () => {
      assert.equal(cleanSpokenName('sophie'), 'Sophie')
      assert.equal(cleanSpokenName('kishlay raj'), 'Kishlay Raj')
    })

    test('handles empty or non-string inputs safely', () => {
      assert.equal(cleanSpokenName(''), '')
      assert.equal(cleanSpokenName(null), '')
      assert.equal(cleanSpokenName(undefined), '')
    })
  })

  describe('detectOS()', () => {
    test('detects mac from platform or userAgentData', () => {
      assert.equal(detectOS({ platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh...)' }), 'mac')
      assert.equal(detectOS({ userAgentData: { platform: 'macOS' } }), 'mac')
    })

    test('detects windows from platform or userAgentData', () => {
      assert.equal(detectOS({ platform: 'Win32', userAgent: 'Mozilla/5.0 (Windows NT 10.0...)' }), 'windows')
      assert.equal(detectOS({ userAgentData: { platform: 'Windows' } }), 'windows')
    })

    test('detects linux from platform', () => {
      assert.equal(detectOS({ platform: 'Linux x86_64', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }), 'linux')
    })

    test('falls back gracefully if unknown or missing', () => {
      assert.equal(detectOS(null), 'other')
      assert.equal(detectOS({ platform: 'UnknownOS', userAgent: '' }), 'other')
    })
  })

  describe('getOSShortcutDetails()', () => {
    test('returns Mac shortcut details with Fn key', () => {
      const details = getOSShortcutDetails('mac')
      assert.equal(details.os, 'mac')
      assert.equal(details.instruction, 'On Mac, press')
      assert.deepEqual(details.keys, ['Fn'])
      assert.equal(details.fullText, 'On Mac, press Fn to speak with Wispr Flow')
    })

    test('returns Windows shortcut details with Ctrl + Win keys', () => {
      const details = getOSShortcutDetails('windows')
      assert.equal(details.os, 'windows')
      assert.equal(details.instruction, 'On Windows, press')
      assert.deepEqual(details.keys, ['Ctrl', '⊞ Win'])
      assert.equal(details.fullText, 'On Windows, press Ctrl + Win to dictate with Wispr Flow')
    })

    test('returns fallback details for other platforms', () => {
      const details = getOSShortcutDetails('other')
      assert.equal(details.os, 'other')
      assert.deepEqual(details.keys, ['Wispr Flow'])
    })
  })

  describe('getModKey() and getAppShortcuts()', () => {
    test('returns ⌘ symbols and Fn key on Mac', () => {
      const macNav = { platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh)' }
      assert.equal(getModKey(macNav), '⌘')
      const shortcuts = getAppShortcuts(macNav)
      assert.equal(shortcuts.isMac, true)
      assert.equal(shortcuts.mod, '⌘')
      assert.equal(shortcuts.wisprKey, 'Fn')
      assert.equal(shortcuts.focus, '⌘K')
      assert.equal(shortcuts.undo, '⌘Z')
      assert.equal(shortcuts.footerText, '⌘K focus · ⌘Z undo')
      assert.equal(shortcuts.captureText, '⌘K search')
      assert.equal(shortcuts.capturePlaceholder, 'Add task (⌘K to search) or hold Wispr Flow key (Fn) to yap…')
    })

    test('returns Ctrl+ shortcuts and Ctrl + Win keys on Windows', () => {
      const winNav = { platform: 'Win32', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      assert.equal(getModKey(winNav), 'Ctrl+')
      const shortcuts = getAppShortcuts(winNav)
      assert.equal(shortcuts.isMac, false)
      assert.equal(shortcuts.mod, 'Ctrl+')
      assert.equal(shortcuts.wisprKey, 'Ctrl + Win')
      assert.equal(shortcuts.focus, 'Ctrl+K')
      assert.equal(shortcuts.undo, 'Ctrl+Z')
      assert.equal(shortcuts.footerText, 'Ctrl+K focus · Ctrl+Z undo')
      assert.equal(shortcuts.captureText, 'Ctrl+K search')
      assert.equal(shortcuts.capturePlaceholder, 'Add task (Ctrl+K to search) or hold Wispr Flow key (Ctrl + Win) to yap…')
    })

    test('returns Ctrl+ shortcuts on Linux / other', () => {
      const linuxNav = { platform: 'Linux x86_64', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }
      assert.equal(getModKey(linuxNav), 'Ctrl+')
      const shortcuts = getAppShortcuts(linuxNav)
      assert.equal(shortcuts.footerText, 'Ctrl+K focus · Ctrl+Z undo')
      assert.equal(shortcuts.captureText, 'Ctrl+K search')
      assert.equal(shortcuts.capturePlaceholder, 'Add task (Ctrl+K to search) or hold Wispr Flow key to yap…')
    })
  })

  describe('shouldShowWelcomeGate()', () => {
    const createMockStorage = (data = {}) => ({
      getItem: (key) => (key in data ? data[key] : null),
      setItem: (key, val) => {
        data[key] = String(val)
      },
    })

    test('returns true for first time user without name or welcomed flag', () => {
      const storage = createMockStorage({})
      assert.equal(shouldShowWelcomeGate(storage), true)
    })

    test('returns false if custom name already saved in localStorage', () => {
      const storage = createMockStorage({ [WELCOME_NAME_STORAGE_KEY]: 'Chihiro' })
      assert.equal(shouldShowWelcomeGate(storage), false)
    })

    test('returns false if user already welcomed', () => {
      const storage = createMockStorage({ [WELCOMED_FLAG_STORAGE_KEY]: 'true' })
      assert.equal(shouldShowWelcomeGate(storage), false)
    })

    test('returns false if v1 planner state has a stored name', () => {
      const storage = createMockStorage({
        'yap-it-done:v1': JSON.stringify({ prefs: { name: 'Sophie' } }),
      })
      assert.equal(shouldShowWelcomeGate(storage), false)
    })
  })
})
