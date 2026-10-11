/**
 * Helper functions and state utilities for the First-Time Welcome Experience
 * ("Whisper your name").
 */

export const WELCOME_NAME_STORAGE_KEY = 'yap-it-done:name'
export const WELCOMED_FLAG_STORAGE_KEY = 'yap-it-done:welcomed'

/**
 * Detect client OS for Wispr Flow global shortcut presentation.
 */
export function detectOS(customNavigator) {
  const nav = customNavigator !== undefined ? customNavigator : (typeof navigator !== 'undefined' ? navigator : null)
  if (!nav) return 'other'

  const userAgentData = nav.userAgentData?.platform?.toLowerCase() || ''
  const platform = (nav.platform || '').toLowerCase()
  const ua = (nav.userAgent || '').toLowerCase()

  if (userAgentData.includes('mac') || platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) {
    return 'mac'
  }
  if (userAgentData.includes('win') || platform.includes('win') || ua.includes('windows')) {
    return 'windows'
  }
  if (platform.includes('linux') || ua.includes('linux')) {
    return 'linux'
  }
  return 'other'
}

/**
 * Returns OS-specific shortcut labeling and keycaps for Wispr Flow.
 */
export function getOSShortcutDetails(os) {
  switch (os) {
    case 'mac':
      return {
        os: 'mac',
        osName: 'Mac',
        instruction: 'On Mac, press',
        actionText: 'to speak with Wispr Flow',
        keys: ['Fn'],
        fullText: 'On Mac, press Fn to speak with Wispr Flow',
      }
    case 'windows':
      return {
        os: 'windows',
        osName: 'Windows',
        instruction: 'On Windows, press',
        actionText: 'to dictate with Wispr Flow',
        keys: ['Ctrl', '⊞ Win'],
        fullText: 'On Windows, press Ctrl + Win to dictate with Wispr Flow',
      }
    default:
      return {
        os: 'other',
        osName: 'Desktop',
        instruction: 'Press',
        actionText: 'to dictate with Wispr Flow',
        keys: ['Wispr Flow'],
        fullText: 'Press the shortcut to dictate with Wispr Flow',
      }
  }
}

/**
 * Returns the primary modifier key representation ('⌘' for Mac, 'Ctrl+' for Windows/Linux).
 */
export function getModKey(customNavigator) {
  return detectOS(customNavigator) === 'mac' ? '⌘' : 'Ctrl+'
}

/**
 * Returns the formatted shortcut hint strings based on the detected OS.
 */
export function getAppShortcuts(customNavigator) {
  const os = detectOS(customNavigator)
  const isMac = os === 'mac'
  const mod = isMac ? '⌘' : 'Ctrl+'
  const wisprKey = isMac ? 'Fn' : os === 'windows' ? 'Ctrl + Win' : 'Fn / Ctrl + Win'
  const capturePlaceholder = isMac
    ? 'Add task or hold Wispr Flow key (Fn) to yap…'
    : os === 'windows'
    ? 'Add task or hold Wispr Flow key (Ctrl + Win) to yap…'
    : 'Add task or hold Wispr Flow key to yap…'

  return {
    os,
    isMac,
    mod,
    wisprKey,
    focus: `${mod}K`,
    undo: `${mod}Z`,
    footerText: `${mod}K focus · ${mod}Z undo`,
    captureText: `${mod}K search`,
    capturePlaceholder,
  }
}

/**
 * Clean spoken phrases to extract a natural first/full name.
 */
export function cleanSpokenName(transcript) {
  if (!transcript || typeof transcript !== 'string') return ''
  let cleaned = transcript.trim()
  // Remove common speech preamble like "my name is", "i am", "call me"
  cleaned = cleaned.replace(/^(hello|hi|hey|um|uh|please)?\s*(my name is|i am|i'm|call me|this is|it's|its)\s+/i, '')
  // Strip trailing punctuation
  cleaned = cleaned.replace(/[.!?]+$/, '').trim()
  // Capitalize each word nicely
  if (cleaned) {
    cleaned = cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }
  return cleaned
}

/**
 * Check if the user should see the welcome gate.
 */
export function shouldShowWelcomeGate(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  if (!storage) return false
  try {
    const savedName = storage.getItem(WELCOME_NAME_STORAGE_KEY)
    if (savedName && savedName.trim()) return false

    const welcomed = storage.getItem(WELCOMED_FLAG_STORAGE_KEY)
    if (welcomed === 'true') return false

    const v1 = JSON.parse(storage.getItem('yap-it-done:v1') || '{}')
    if (v1?.prefs?.name && String(v1.prefs.name).trim()) return false

    return true
  } catch {
    return false
  }
}
