import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Moon,
  Clock,
  Play,
  Pause,
  Square,
  RotateCcw,
  SkipBack,
  SkipForward,
  ChevronDown,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  Sparkles,
} from 'lucide-react'
import { dayStats } from './Header'
import { getBriefStats } from '../lib/brief'

function pickVoice(voiceList) {
  const vs = voiceList || (typeof window !== 'undefined' && window.speechSynthesis?.getVoices()) || []
  if (!vs.length) return null
  return (
    vs.find((v) => /en-IN/i.test(v.lang) && /google|natural|neural|premium|enhanced/i.test(v.name)) ||
    vs.find((v) => /Google UK English Female|Google US English/i.test(v.name)) ||
    vs.find((v) => /Samantha|Ava|Allison|Karen|Daniel/i.test(v.name)) ||
    vs.find((v) => /natural|neural|premium/i.test(v.name) && v.lang?.startsWith('en')) ||
    vs.find((v) => /en-IN/i.test(v.lang)) ||
    vs.find((v) => /en-US/i.test(v.lang)) ||
    vs.find((v) => /en-GB/i.test(v.lang)) ||
    vs.find((v) => v.lang?.startsWith('en')) ||
    vs[0] ||
    null
  )
}

const BRIEF_TABS = [
  { mode: 'now', label: 'Rest of today', icon: Clock },
  { mode: 'morning', label: 'Morning', icon: Sun },
  { mode: 'evening', label: 'Evening', icon: Moon },
]

const SPEED_OPTIONS = [0.8, 1.0, 1.2, 1.5]

export default function BriefWidget({ brief, state, onClose, onChangeMode }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [speaking, setSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [voice, setVoice] = useState(null)

  const runId = useRef(0)
  const utterancesRef = useRef([])
  const activeSentenceRef = useRef(null)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  const stats = useMemo(() => brief?.stats || (state ? getBriefStats(state) : null), [brief, state])

  // Clean voice discovery with voiceschanged support for Chrome/Edge
  useEffect(() => {
    if (!canSpeak) return
    const updateVoice = () => {
      const vs = window.speechSynthesis.getVoices() || []
      const chosen = pickVoice(vs)
      if (chosen) setVoice(chosen)
    }
    updateVoice()
    window.speechSynthesis.addEventListener('voiceschanged', updateVoice)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoice)
    }
  }, [canSpeak])

  // Chrome 14-second SpeechSynthesis freeze keep-alive ping
  useEffect(() => {
    if (!speaking || isPaused || !canSpeak) return
    const keepAliveTimer = setInterval(() => {
      if (window.speechSynthesis?.speaking && !window.speechSynthesis?.paused) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 10000)
    return () => clearInterval(keepAliveTimer)
  }, [speaking, isPaused, canSpeak])

  // Sentence-by-sentence sequential speech player
  const speakSentence = useCallback(
    (index, targetSpeed = speed) => {
      if (!brief?.sentences?.length || !canSpeak) return

      // Finished all sentences
      if (index < 0 || index >= brief.sentences.length) {
        setSpeaking(false)
        setIsPaused(false)
        setActiveIndex(-1)
        return
      }

      const id = ++runId.current
      window.speechSynthesis.cancel()

      const text = brief.sentences[index]
      const utterance = new SpeechSynthesisUtterance(text)
      const currentVoice = voice || pickVoice()
      if (currentVoice) utterance.voice = currentVoice
      utterance.rate = targetSpeed
      utterance.pitch = 1.0

      utterance.onstart = () => {
        if (runId.current === id) {
          setActiveIndex(index)
          setSpeaking(true)
          setIsPaused(false)
        }
      }

      utterance.onend = () => {
        if (runId.current === id) {
          if (index + 1 < brief.sentences.length) {
            speakSentence(index + 1, targetSpeed)
          } else {
            setSpeaking(false)
            setIsPaused(false)
            setActiveIndex(-1)
          }
        }
      }

      utterance.onerror = (e) => {
        if (runId.current === id && e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('[BriefWidget] Speech synthesis warning:', e)
          if (index + 1 < brief.sentences.length) {
            speakSentence(index + 1, targetSpeed)
          } else {
            setSpeaking(false)
            setIsPaused(false)
          }
        }
      }

      // Keep strong reference in ref array so Chrome GC does not drop it midway
      utterancesRef.current = [utterance]

      window.speechSynthesis.speak(utterance)

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    },
    [brief, canSpeak, speed, voice],
  )

  const stop = useCallback(() => {
    runId.current++
    if (canSpeak) window.speechSynthesis.cancel()
    setSpeaking(false)
    setIsPaused(false)
    setActiveIndex(-1)
    utterancesRef.current = []
  }, [canSpeak])

  const togglePlay = useCallback(() => {
    if (!canSpeak || !brief) return
    if (speaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    } else if (isPaused) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      } else {
        speakSentence(activeIndex >= 0 ? activeIndex : 0)
      }
      setIsPaused(false)
      setSpeaking(true)
    } else {
      speakSentence(activeIndex >= 0 ? activeIndex : 0)
    }
  }, [canSpeak, brief, speaking, isPaused, speakSentence, activeIndex])

  const replay = useCallback(() => {
    speakSentence(0)
  }, [speakSentence])

  const next = useCallback(() => {
    if (!brief) return
    if (activeIndex < brief.sentences.length - 1) {
      speakSentence(activeIndex + 1)
    }
  }, [brief, activeIndex, speakSentence])

  const prev = useCallback(() => {
    if (!brief) return
    speakSentence(Math.max(0, activeIndex > 0 ? activeIndex - 1 : 0))
  }, [brief, activeIndex, speakSentence])

  const cycleSpeed = useCallback(() => {
    const nextIdx = (SPEED_OPTIONS.indexOf(speed) + 1) % SPEED_OPTIONS.length
    const newSpeed = SPEED_OPTIONS[nextIdx]
    setSpeed(newSpeed)
    if (speaking && !isPaused && activeIndex >= 0) {
      speakSentence(activeIndex, newSpeed)
    }
  }, [speed, speaking, isPaused, activeIndex, speakSentence])

  // When a new brief is requested, expand and autoplay from sentence 0
  useEffect(() => {
    if (!brief) return
    setMinimized(false)
    const timer = setTimeout(() => {
      speakSentence(0)
    }, 120)
    return () => {
      clearTimeout(timer)
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief?.title, brief?.timestamp])

  // Auto-scroll active karaoke sentence into view inside widget
  useEffect(() => {
    if (activeIndex >= 0 && activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeIndex])

  // Escape key minimizes or closes
  useEffect(() => {
    if (!brief) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (!minimized) {
          setMinimized(true)
        } else {
          stop()
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [brief, minimized, stop, onClose])

  if (!brief) return null

  const currentMode = brief.mode || (brief.title.toLowerCase().includes('morning') ? 'morning' : brief.title.toLowerCase().includes('evening') ? 'evening' : 'now')
  const totalSentences = brief.sentences?.length || 0
  const progressPercent = totalSentences > 0 ? Math.round(((Math.max(0, activeIndex) + 1) / totalSentences) * 100) : 0

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence mode="wait">
        {minimized ? (
          /* ================= MINIMIZED CAPSULE ================= */
          <motion.div
            key="minimized"
            layoutId="brief-widget"
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-pink-500/25 bg-white/92 px-3.5 py-2 shadow-2xl shadow-black/15 backdrop-blur-xl sm:px-4 dark:border-pink-500/20 dark:bg-[#140d18]/95"
          >
            {/* Pulsating Orb with sound wave indicator */}
            <button
              type="button"
              onClick={() => setMinimized(false)}
              className="relative grid place-items-center group"
              title="Click to expand brief"
            >
              <div className={`orb ${speaking && !isPaused ? 'is-fast' : ''} size-7 shrink-0 rounded-full transition group-hover:scale-105`} />
              {speaking && !isPaused && (
                <span className="absolute -inset-1 animate-ping rounded-full bg-pink-500/20 pointer-events-none" />
              )}
            </button>

            {/* Title & Status */}
            <div
              className="cursor-pointer select-none pr-1"
              onClick={() => setMinimized(false)}
              title="Click to expand brief"
            >
              <div className="flex items-center gap-1.5 font-sans text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                <span>{brief.title}</span>
                {speaking && !isPaused && (
                  <span className="size-1.5 rounded-full bg-pink-500 animate-pulse" />
                )}
              </div>
              <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                {activeIndex >= 0 ? `Part ${activeIndex + 1}/${totalSentences}` : speaking ? 'Speaking' : 'Paused'} · {speed}x
              </div>
            </div>

            {/* Mini Player Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={togglePlay}
                className="grid size-7 place-items-center rounded-full bg-zinc-900 text-white transition hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-900"
                title={speaking && !isPaused ? 'Pause' : 'Play'}
              >
                {speaking && !isPaused ? (
                  <Pause className="size-3.5 fill-current" />
                ) : (
                  <Play className="size-3.5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMinimized(false)}
                className="grid size-7 place-items-center rounded-full text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                title="Expand brief player"
              >
                <Maximize2 className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  stop()
                  onClose()
                }}
                className="grid size-7 place-items-center rounded-full text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                title="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ================= EXPANDED FLOATING WIDGET ================= */
          <motion.div
            key="expanded"
            layoutId="brief-widget"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="glow-card pointer-events-auto relative w-[calc(100vw-2rem)] sm:w-[430px] max-w-[440px] overflow-hidden rounded-[28px] border border-pink-500/20 bg-white/95 p-5 shadow-2xl shadow-pink-500/10 backdrop-blur-2xl dark:border-pink-500/25 dark:bg-[#150d18]/95"
            data-lenis-prevent
          >
            {/* Header: Orb, Title, Visualizer, Speed, Minimize, Close */}
            <div className="flex items-center justify-between gap-3 pb-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative grid place-items-center shrink-0">
                  <div className={`orb ${speaking && !isPaused ? 'is-fast' : ''} size-10 rounded-full`} />
                  {speaking && !isPaused && (
                    <span className="absolute -inset-1 animate-ping rounded-full bg-pink-500/15 pointer-events-none" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-pink-600 dark:text-pink-400">
                      {speaking && !isPaused ? 'Playing voice brief' : isPaused ? 'Paused' : 'Voice brief'}
                    </span>
                    {/* Dynamic Dancing Visualizer Bars */}
                    <div className="flex items-center gap-0.5 h-3">
                      {[0.4, 0.9, 0.3, 0.8, 0.5].map((scale, i) => (
                        <motion.span
                          key={i}
                          animate={
                            speaking && !isPaused
                              ? { scaleY: [0.25, 1, 0.3, 0.85, 0.25] }
                              : { scaleY: 0.25 }
                          }
                          transition={{
                            duration: 0.65 + i * 0.12,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                          }}
                          className="w-0.5 h-3 rounded-full bg-gradient-to-t from-pink-500 to-amber-400 origin-bottom"
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl leading-tight truncate text-zinc-900 dark:text-zinc-50">
                    {brief.title}
                  </h3>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Speed toggle */}
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="rounded-lg border border-black/10 bg-black/5 px-2 py-1 font-mono text-[11px] font-medium text-zinc-700 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                  title="Playback speed"
                >
                  {speed}x
                </button>

                {/* Minimize */}
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  className="rounded-full p-1.5 text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                  title="Minimize to floating pill"
                >
                  <Minimize2 className="size-4" />
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => {
                    stop()
                    onClose()
                  }}
                  className="rounded-full p-1.5 text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-500 dark:text-zinc-400"
                  title="Close brief"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Brief Switcher Tabs */}
            {onChangeMode && (
              <div className="mb-3.5 flex items-center gap-1.5 rounded-2xl border border-black/[0.06] bg-black/[0.03] p-1 dark:border-white/[0.08] dark:bg-white/[0.03]">
                {BRIEF_TABS.map(({ mode, label, icon: TabIcon }) => {
                  const isActive = currentMode === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onChangeMode(mode)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'border border-pink-500/30 bg-white font-semibold text-pink-600 shadow-sm dark:bg-[#201524] dark:text-pink-300'
                          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      <TabIcon className="size-3.5" />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Live Day Stats Pill Row */}
            {stats && (
              <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-sky-700 dark:text-sky-300">
                  <span className="size-1 rounded-full bg-sky-400" />
                  <b>{stats.eventCount ?? stats.events?.length ?? 0}</b> events
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 text-pink-700 dark:text-pink-300">
                  <span className="size-1 rounded-full bg-pink-400" />
                  <b>{stats.todoCount ?? stats.todos?.length ?? 0}</b> to-dos
                </span>
                {(stats.doneCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                    <span className="size-1 rounded-full bg-emerald-400" />
                    <b>{stats.doneCount}</b> done
                  </span>
                )}
                {(stats.riskyCount ?? stats.risky?.length ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-rose-700 dark:text-rose-300">
                    <span className="size-1 rounded-full bg-rose-400" />
                    <b>{stats.riskyCount ?? stats.risky?.length}</b> at risk
                  </span>
                )}
                {stats.free && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                    {stats.free}
                  </span>
                )}
              </div>
            )}

            {/* Karaoke Sentences Container */}
            <div className="thin-scrollbar max-h-[38vh] min-h-[160px] space-y-2 overflow-y-auto pr-1">
              {brief.sentences?.map((text, i) => {
                const isCurrent = activeIndex === i
                return (
                  <motion.div
                    key={i}
                    ref={isCurrent ? activeSentenceRef : null}
                    onClick={() => speakSentence(i)}
                    className={`cursor-pointer rounded-2xl p-2.5 transition-all ${
                      isCurrent
                        ? 'border border-pink-500/30 bg-pink-500/[0.08] shadow-sm dark:border-pink-500/40 dark:bg-pink-500/[0.14]'
                        : 'opacity-45 hover:opacity-85 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full transition ${
                          isCurrent ? 'bg-pink-500 animate-pulse' : 'bg-transparent'
                        }`}
                      />
                      <p
                        className={`text-sm leading-relaxed transition-colors sm:text-base ${
                          isCurrent
                            ? 'font-medium text-zinc-950 dark:text-white'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {text}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Progress Scrub Bar */}
            <div className="mt-3.5 space-y-2 border-t border-black/[0.06] pt-3.5 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                <span>
                  {activeIndex >= 0 ? `Part ${activeIndex + 1} of ${totalSentences}` : 'Ready to listen'}
                </span>
                <span>{voice?.name ? voice.name.replace(/Google|Microsoft|Apple|Natural|Desktop/g, '').trim().slice(0, 16) || 'Natural Voice' : 'Web Speech'}</span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              {/* Bottom Player Toolbar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={replay}
                    className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-2.5 py-1.5 text-xs text-zinc-700 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                    title="Replay from start"
                  >
                    <RotateCcw className="size-3.5" />
                    <span className="hidden sm:inline">Replay</span>
                  </button>

                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-2.5 py-1.5 text-xs text-zinc-700 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                    title="Stop playback"
                  >
                    <Square className="size-3 fill-current" />
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                </div>

                {/* Main Player Scrub: Prev, Play/Pause, Next */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={activeIndex <= 0}
                    className="grid size-8 place-items-center rounded-full text-zinc-600 transition hover:bg-black/5 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-white/10"
                    title="Previous sentence"
                  >
                    <SkipBack className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="grid size-10 place-items-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 transition hover:scale-105 active:scale-95"
                    title={speaking && !isPaused ? 'Pause' : 'Play'}
                  >
                    {speaking && !isPaused ? (
                      <Pause className="size-4 fill-current" />
                    ) : (
                      <Play className="size-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    disabled={activeIndex >= totalSentences - 1}
                    className="grid size-8 place-items-center rounded-full text-zinc-600 transition hover:bg-black/5 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-white/10"
                    title="Next sentence"
                  >
                    <SkipForward className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
