import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, ArrowRight, Sparkles, X, Sun, Moon, Volume2, Check } from 'lucide-react'
import { WisprFlowSymbol, WisprFlowModal } from './YapLogo'

import {
  detectOS,
  getOSShortcutDetails,
  cleanSpokenName,
  WELCOME_NAME_STORAGE_KEY,
  WELCOMED_FLAG_STORAGE_KEY,
} from '../lib/welcome'

export { detectOS, getOSShortcutDetails, cleanSpokenName }

/**
 * Painterly Studio Ghibli cloud silhouettes with soft billowy cumulus mounds.
 */
function GhibliClouds({ theme = 'light' }) {
  const isDark = theme === 'dark'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {/* Tier 1: Distant Horizon Cumulus Bank (Deep background drift) */}
      <motion.div
        initial={{ x: '-4%', y: 0 }}
        animate={{ x: ['-4%', '3%', '-4%'], y: [0, -6, 0] }}
        transition={{ duration: 42, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-16 left-[-15%] right-[-15%] h-[420px] opacity-60 sm:opacity-75"
      >
        <svg viewBox="0 0 1600 500" preserveAspectRatio="none" className="size-full">
          <defs>
            <linearGradient id="cloudBankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#312e81" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#1e1b4b" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#0c0914" stopOpacity="0.95" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#fef08a" stopOpacity="0.75" />
                  <stop offset="65%" stopColor="#fbcfe8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.4" />
                </>
              )}
            </linearGradient>
            <filter id="cloudBlurDistant" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <path
            filter="url(#cloudBlurDistant)"
            fill="url(#cloudBankGrad)"
            d="M0,500 L0,320 C60,300 110,240 180,250 C240,190 340,180 410,220 C470,160 590,140 680,190 C760,110 900,100 990,170 C1060,130 1170,140 1240,190 C1310,130 1430,150 1490,230 C1550,260 1580,310 1600,340 L1600,500 Z"
          />
        </svg>
      </motion.div>

      {/* Tier 2: Mid-sky Floating Billows (Gentle parallax left-to-right float) */}
      <motion.div
        initial={{ x: '-12%', y: -10 }}
        animate={{ x: ['-12%', '8%', '-12%'], y: [-10, 10, -10] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[18%] left-[-10%] w-[580px] sm:w-[720px] opacity-70 sm:opacity-85"
      >
        <svg viewBox="0 0 720 320" className="size-full">
          <defs>
            <linearGradient id="cloudMidLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#4338ca" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#1e1b4b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0c0914" stopOpacity="0.2" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#fdf4ff" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0.4" />
                </>
              )}
            </linearGradient>
            <filter id="cloudSoftBlur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <path
            filter="url(#cloudSoftBlur)"
            fill="url(#cloudMidLeft)"
            d="M60,220 C30,220 10,195 25,170 C15,140 40,110 75,115 C95,75 150,60 190,85 C220,50 280,45 320,75 C360,50 420,55 450,90 C490,75 540,95 550,135 C590,145 610,185 585,215 C600,235 580,265 540,265 L90,265 C60,265 45,245 60,220 Z"
          />
        </svg>
      </motion.div>

      {/* Tier 3: Right Upper Ghibli Dream Cloud */}
      <motion.div
        initial={{ x: '10%', y: 15 }}
        animate={{ x: ['10%', '-8%', '10%'], y: [15, -12, 15] }}
        transition={{ duration: 36, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[12%] right-[-8%] w-[520px] sm:w-[680px] opacity-65 sm:opacity-80"
      >
        <svg viewBox="0 0 680 300" className="size-full">
          <defs>
            <linearGradient id="cloudMidRight" x1="0%" y1="0%" x2="0%" y2="100%">
              {isDark ? (
                <>
                  <stop offset="0%" stopColor="#3b0764" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#1e1b4b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0c0914" stopOpacity="0.2" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="45%" stopColor="#fef3c7" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.35" />
                </>
              )}
            </linearGradient>
          </defs>
          <path
            filter="url(#cloudSoftBlur)"
            fill="url(#cloudMidRight)"
            d="M80,210 C45,210 20,185 40,155 C30,120 65,95 100,105 C125,65 180,50 225,75 C265,40 335,40 375,70 C415,45 480,50 510,85 C550,75 595,95 605,135 C640,150 650,190 625,220 C640,240 620,270 580,270 L110,270 C80,270 65,240 80,210 Z"
          />
        </svg>
      </motion.div>

      {/* Floating Sparkles / Ghibli Golden Pollen Motes */}
      <div className="absolute inset-0">
        {[
          { top: '22%', left: '18%', delay: 0, size: 4 },
          { top: '35%', left: '78%', delay: 1.2, size: 5 },
          { top: '65%', left: '28%', delay: 2.1, size: 3 },
          { top: '48%', left: '85%', delay: 0.8, size: 4 },
          { top: '28%', left: '60%', delay: 1.8, size: 6 },
          { top: '75%', left: '72%', delay: 2.5, size: 4 },
        ].map((mote, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.2, y: 0, scale: 0.8 }}
            animate={{
              opacity: [0.2, 0.85, 0.2],
              y: [0, -18, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4.5 + (i % 3),
              repeat: Infinity,
              delay: mote.delay,
              ease: 'easeInOut',
            }}
            style={{
              top: mote.top,
              left: mote.left,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
            }}
            className={`absolute rounded-full pointer-events-none ${
              isDark
                ? 'bg-indigo-300 shadow-[0_0_10px_#a5b4fc]'
                : 'bg-amber-300 shadow-[0_0_12px_#fde047]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Keycap pill rendering physical tactile keys.
 */
function Keycap({ label }) {
  return (
    <kbd className="inline-flex min-w-[28px] items-center justify-center rounded-md border border-black/15 border-b-[3px] border-b-black/30 bg-gradient-to-b from-white via-zinc-50 to-zinc-200 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform active:translate-y-[1px] active:border-b-2 dark:border-white/20 dark:border-b-[3px] dark:border-b-black/80 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 dark:text-zinc-100 dark:shadow-[0_1px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
      {label}
    </kbd>
  )
}

/**
 * First-Time Interactive Welcome Experience:
 * "Whisper your name" with painterly Ghibli clouds, grainy film texture,
 * Web Speech API dictation, and OS-aware Wispr Flow shortcut guidance.
 */
export default function WelcomeGate({
  initialName = '',
  onComplete,
  onClose,
  canClose = false,
  theme = 'light',
  onToggleTheme,
}) {
  const [name, setName] = useState(initialName || '')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [micFeedback, setMicFeedback] = useState(null)
  const [showWisprModal, setShowWisprModal] = useState(false)

  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const os = useMemo(() => detectOS(), [])
  const osInfo = useMemo(() => getOSShortcutDetails(os), [os])

  // Detect Web Speech API support
  useEffect(() => {
    const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    setSpeechSupported(Boolean(SpeechRec))
  }, [])

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const startListening = () => {
    const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SpeechRec) {
      setMicFeedback('Voice dictation is supported in Chrome, Edge, and Safari. You can type your name directly!')
      setTimeout(() => setMicFeedback(null), 4500)
      inputRef.current?.focus()
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }

      const rec = new SpeechRec()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = navigator.language || 'en-US'

      rec.onstart = () => {
        setIsListening(true)
        setMicFeedback('Whispering… Speak your name clearly.')
      }

      rec.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((res) => res[0]?.transcript || '')
          .join(' ')
        const cleaned = cleanSpokenName(transcript)
        if (cleaned) {
          setName(cleaned)
        }
      }

      rec.onerror = (e) => {
        console.warn('[WelcomeGate] Speech recognition error:', e.error)
        setIsListening(false)
        if (e.error === 'not-allowed') {
          setMicFeedback('Microphone permission denied. Feel free to type your name!')
        } else if (e.error === 'no-speech') {
          setMicFeedback('Didn’t catch that whisper. Tap mic to try again or type!')
        } else {
          setMicFeedback('Speech recognition pause. You can type your name!')
        }
        setTimeout(() => setMicFeedback(null), 4000)
      }

      rec.onend = () => {
        setIsListening(false)
        setTimeout(() => setMicFeedback(null), 2500)
      }

      recognitionRef.current = rec
      rec.start()
    } catch (err) {
      console.warn('[WelcomeGate] Failed to start speech recognition:', err)
      setIsListening(false)
      setMicFeedback('Microphone unavailable. You can type your name!')
      setTimeout(() => setMicFeedback(null), 3500)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
    }
    setIsListening(false)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleCommit = (overrideName) => {
    const raw = overrideName !== undefined ? overrideName : name
    const finalName = raw.trim() || 'Kishlay'
    onComplete(finalName)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommit(name)
    } else if (e.key === 'Escape' && canClose && onClose) {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-x-hidden overflow-y-auto"
      style={{
        backgroundColor: theme === 'dark' ? '#0c0914' : '#fffafd',
      }}
    >
      {/* 1. Aesthetic Ghibli Painterly Sky Gradient Backdrop */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-700"
        style={{
          background:
            theme === 'dark'
              ? `
                radial-gradient(1100px 720px at 50% 12%, rgba(196, 181, 253, 0.18), transparent 70%),
                radial-gradient(900px 600px at 15% 40%, rgba(219, 39, 119, 0.22), transparent 60%),
                radial-gradient(1000px 700px at 85% 50%, rgba(30, 58, 138, 0.28), transparent 65%),
                linear-gradient(180deg, #0c0914 0%, #15102a 35%, #1e1b4b 70%, #020617 100%)
              `
              : `
                radial-gradient(1100px 720px at 50% 12%, rgba(253, 230, 138, 0.65), rgba(251, 207, 232, 0.45) 45%, transparent 75%),
                radial-gradient(900px 600px at 15% 42%, rgba(251, 207, 232, 0.55), transparent 60%),
                radial-gradient(1000px 700px at 85% 48%, rgba(196, 181, 253, 0.5), transparent 65%),
                radial-gradient(1200px 500px at 50% 95%, rgba(56, 189, 248, 0.38), transparent 70%),
                linear-gradient(180deg, #fef9c3 0%, #fce7f3 30%, #ede9fe 65%, #e0f2fe 100%)
              `,
        }}
        aria-hidden="true"
      />

      {/* 2. Tactile Film Grain Overlay (SVG feTurbulence fractal noise) */}
      <div
        className="pointer-events-none fixed inset-0 z-10 mix-blend-overlay dark:mix-blend-soft-light"
        style={{
          opacity: theme === 'dark' ? 0.2 : 0.14,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='filmGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.85 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23filmGrain)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* 3. Drifting Watercolor Studio Ghibli Clouds */}
      <GhibliClouds theme={theme} />

      {/* Top Utility Bar: Theme Toggle & Optional Close (X) */}
      <header className="relative z-30 flex items-center justify-end p-4 sm:p-6">
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white/60 text-zinc-700 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-95 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
            </button>
          )}

          {canClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close welcome gate"
              className="flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white/60 text-zinc-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-zinc-900 active:scale-95 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* Center Hero: Editorial Typography & Glassmorphic Voice Input */}
      <main className="relative z-20 mx-auto my-auto flex w-full max-w-3xl flex-col items-center px-4 py-8 text-center sm:px-6">
        {/* Soft Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10 px-3.5 py-1 text-xs font-medium text-pink-700 backdrop-blur-md dark:border-pink-400/20 dark:text-pink-300"
        >
          <Sparkles className="size-3.5 text-pink-500 animate-pulse" />
          <span>Interactive Voice Entrance</span>
        </motion.div>

        {/* Big Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-5xl font-normal tracking-tight text-zinc-900 sm:text-6xl md:text-7xl lg:text-8xl dark:text-zinc-50"
        >
          Whisper your{' '}
          <span className="italic bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
            name
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-md text-base text-zinc-600 sm:text-lg dark:text-zinc-300 font-sans leading-relaxed"
        >
          Speak it or type it to step into your daily flow.
        </motion.p>

        {/* Stylish Glassmorphic Input Card with Breathing Halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-8 w-full max-w-lg group"
        >
          {/* Animated Glowing Aura */}
          <div
            className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-sky-400/40 blur-xl transition duration-500 ${
              isListening ? 'opacity-100 scale-105 animate-pulse' : 'opacity-50 group-hover:opacity-80'
            }`}
          />

          <div className="relative flex items-center gap-2 rounded-2xl border border-white/60 bg-white/75 p-2 shadow-2xl backdrop-blur-2xl transition sm:rounded-3xl sm:p-2.5 dark:border-white/15 dark:bg-zinc-900/75 dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
            {/* Animated Mic Button (Wispr Flow / Speech-to-Text) */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Whisper your name (Microphone)'}
              aria-label={isListening ? 'Stop listening' : 'Whisper your name'}
              className={`relative flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:size-14 sm:rounded-2xl cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105'
                  : 'bg-black/5 text-zinc-700 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15'
              }`}
            >
              {isListening ? (
                <div className="flex items-center gap-0.5">
                  <span className="h-3.5 w-1 animate-[bounce_0.6s_infinite_100ms] rounded-full bg-white" />
                  <span className="h-6 w-1 animate-[bounce_0.6s_infinite_200ms] rounded-full bg-white" />
                  <span className="h-4.5 w-1 animate-[bounce_0.6s_infinite_300ms] rounded-full bg-white" />
                  <span className="h-2.5 w-1 animate-[bounce_0.6s_infinite_400ms] rounded-full bg-white" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <Mic className="size-5 sm:size-6 text-pink-500 dark:text-pink-400" />
                  <span className="absolute -bottom-1 -right-1 flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-pink-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-pink-500" />
                  </span>
                </div>
              )}
            </button>

            {/* Stylish Name Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening for your whisper…' : 'Whisper or type your name…'}
              maxLength={40}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 font-serif text-xl sm:text-2xl tracking-tight text-zinc-900 placeholder:font-sans placeholder:text-sm sm:placeholder:text-base placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />

            {/* Commit Button (Enter) */}
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => handleCommit(name)}
              title="Commit name (Enter)"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 font-medium text-white shadow-md shadow-pink-500/25 transition-all duration-200 hover:opacity-95 active:scale-95 disabled:pointer-events-none disabled:opacity-25 sm:size-12 sm:rounded-2xl cursor-pointer"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>

          {/* Feedback & Speech Status Tip */}
          <AnimatePresence>
            {micFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-2.5 text-center text-xs font-medium text-pink-600 dark:text-pink-400"
              >
                {micFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 4. OS-Aware Wispr Flow Shortcut Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setShowWisprModal(true)}
            title="Click to learn how Wispr Flow voice typing works"
            className="group inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-4 py-1.5 text-xs text-zinc-700 shadow-sm backdrop-blur-xl transition hover:border-pink-400/50 hover:bg-white/90 hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-900/95 dark:hover:text-zinc-100 cursor-pointer"
          >
            <WisprFlowSymbol size={13} className="text-pink-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span>{osInfo.instruction}</span>
            <div className="flex items-center gap-1">
              {osInfo.keys.map((k, idx) => (
                <span key={k} className="inline-flex items-center gap-1">
                  {idx > 0 && <span className="text-zinc-400 text-[10px] font-mono">+</span>}
                  <Keycap label={k} />
                </span>
              ))}
            </div>
            <span>{osInfo.actionText}</span>
          </button>
        </motion.div>

        {/* Bypass / Quick Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-6 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400"
        >
          <button
            type="button"
            onClick={() => handleCommit('Kishlay')}
            className="transition hover:text-pink-600 hover:underline dark:hover:text-pink-400 cursor-pointer"
          >
            Continue as Kishlay
          </button>
        </motion.div>
      </main>

      {/* 5. Bottom Branding */}
      <footer className="relative z-30 pb-6 pt-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-white/50 px-3.5 py-1 text-xs font-medium text-zinc-600 backdrop-blur-md dark:border-sky-400/20 dark:bg-zinc-900/50 dark:text-zinc-300">
          <WisprFlowSymbol size={12} className="text-pink-500" />
          <span>Powered by Wispr Flow and Google Gemini</span>
        </div>
      </footer>

      {/* Wispr Flow Informational Modal */}
      <WisprFlowModal open={showWisprModal} onClose={() => setShowWisprModal(false)} />
    </motion.div>
  )
}
