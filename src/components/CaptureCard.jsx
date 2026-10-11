import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CornerDownLeft, Sparkles, ChevronUp } from 'lucide-react'
import { instantGuess } from '../lib/instant'
import { getAppShortcuts } from '../lib/welcome'

const SUGGESTIONS = [
  'Coffee with Riya at 4',
  'Finished the report',
  'Gym every Mon, Wed, Fri at 7am',
  'Running 30 min late',
  'Fest website pitch due Friday',
]

const CaptureCard = forwardRef(function CaptureCard({ onSubmit, processing, projects }, ref) {
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const shortcuts = useMemo(() => getAppShortcuts(), [])
  const taRef = useRef(null)
  const rootRef = useRef(null)
  const textRef = useRef('')
  textRef.current = text

  // Click outside listener to automatically compress back to original form
  useEffect(() => {
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setExpanded(false)
        setShowSuggestions(false)
      }
    }
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        setExpanded(false)
        setShowSuggestions(false)
        taRef.current?.blur()
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onEscape)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onEscape)
    }
  }, [])

  const submit = async (value = textRef.current) => {
    const t = value.trim()
    if (!t || processing) return
    setText(t)
    const ok = await onSubmit(t)
    if (ok) {
      setText('')
      setExpanded(false)
      setShowSuggestions(false)
    }
    requestAnimationFrame(() => taRef.current?.focus())
  }

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        setExpanded(true)
        taRef.current?.focus()
      },
      run: (t) => submit(t),
      getRect: () => (taRef.current || rootRef.current)?.getBoundingClientRect(),
    }),
    [processing, onSubmit],
  )

  // Height: compact when collapsed (28px), expands up to 90px on active multi-line typing
  useLayoutEffect(() => {
    const el = taRef.current
    if (!el) return
    if (!expanded && !text) {
      el.style.height = '26px'
    } else {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 88)}px`
    }
  }, [text, expanded])

  const guesses = useMemo(() => instantGuess(text, projects), [text, projects])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const status = processing ? 'thinking' : text.trim() ? 'listening' : 'ready'

  return (
    <div className="sticky top-2 z-30 mx-auto w-full max-w-2xl px-2 sm:px-0">
      <motion.div
        ref={rootRef}
        layout
        transition={{ type: 'spring', stiffness: 440, damping: 36 }}
        className={`glow-card relative rounded-2xl border border-pink-500/15 bg-white/85 shadow-lg shadow-pink-500/5 backdrop-blur-2xl transition dark:border-sky-500/15 dark:bg-[#140e1b]/90 dark:shadow-black/30 ${
          processing ? 'is-thinking' : ''
        } ${expanded ? 'ring-1 ring-pink-500/30 dark:ring-sky-500/30' : ''}`}
        onClick={() => {
          setExpanded(true)
          taRef.current?.focus()
        }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
          {/* Compact Sonic Orb */}
          <div className="relative shrink-0">
            <motion.div
              className={`orb ${processing ? 'is-fast' : ''} size-7 rounded-full sm:size-7.5`}
              animate={{ scale: status === 'ready' ? 1 : [1, 1.08, 1] }}
              transition={{
                duration: processing ? 0.6 : 1.5,
                repeat: status === 'ready' ? 0 : Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="orb pointer-events-none absolute inset-0 -z-10 rounded-full opacity-40 blur-md" />
          </div>

          {/* Text input */}
          <div className="min-w-0 flex-1">
            <div className={`relative overflow-hidden ${processing ? 'sweep' : ''}`}>
              <textarea
                ref={taRef}
                rows={1}
                value={text}
                readOnly={processing}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => {
                  setExpanded(true)
                  setShowSuggestions(true)
                }}
                onKeyDown={onKeyDown}
                placeholder={
                  processing
                    ? 'Sorting it out with Gemini…'
                    : expanded
                    ? `Add task or hold Wispr Flow key (${shortcuts.wisprKey}) to yap… (${shortcuts.focus} to search)`
                    : shortcuts.capturePlaceholder
                }
                className="thin-scrollbar block max-h-[88px] w-full resize-none bg-transparent py-0.5 text-xs leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 sm:text-sm dark:text-zinc-100 dark:placeholder:text-zinc-500"
                aria-label={`Add task, search (${shortcuts.focus}), or yap with Wispr Flow (${shortcuts.wisprKey})`}
              />
            </div>

            {/* Instant guesses inline */}
            {expanded && guesses.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                <AnimatePresence initial={false}>
                  {guesses.map((g) => (
                    <motion.span
                      key={g.kind + g.label}
                      initial={{ opacity: 0, y: 3, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="inline-flex items-center gap-1 rounded-md border border-pink-500/25 bg-pink-500/10 px-1.5 py-0.5 font-mono text-[10px] text-pink-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300"
                    >
                      <Zap className="size-2.5" />
                      {g.kind} · {g.label}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action pills & keyboard badges */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {/* Keyboard shortcut badge for quick search / focus */}
            {!expanded && !text && (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-md border border-zinc-200/90 bg-zinc-100/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 select-none dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-400"
                title={`Press ${shortcuts.focus} to trigger search / focus`}
              >
                <kbd>{shortcuts.focus}</kbd>
              </span>
            )}

            {/* Compress / Expand toggle button */}
            {expanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(false)
                  setShowSuggestions(false)
                }}
                title="Compress search bar"
                className="rounded-lg p-1 text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
              >
                <ChevronUp className="size-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(true)
                setShowSuggestions(!showSuggestions)
              }}
              title="Quick suggestions"
              className={`rounded-lg p-1 transition ${
                showSuggestions
                  ? 'bg-pink-500/10 text-pink-600 dark:bg-sky-500/10 dark:text-sky-300'
                  : 'text-zinc-400 hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={processing || !text.trim()}
              onClick={(e) => {
                e.stopPropagation()
                submit()
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-2 py-1 text-[11px] font-medium text-white shadow-sm transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-40"
            >
              <CornerDownLeft className="size-3" />
              <span>yap</span>
            </button>
          </div>
        </div>

        {/* Collapsible Suggestion Drawer */}
        <AnimatePresence>
          {expanded && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="overflow-hidden border-t border-black/5 px-3.5 pb-2.5 pt-2 dark:border-white/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setText(s)
                        taRef.current?.focus()
                      }}
                      className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-0.5 text-[11px] text-zinc-600 transition hover:border-pink-400/50 hover:bg-pink-500/10 hover:text-pink-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:text-sky-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-zinc-400">
                  <span>esc to collapse</span>
                  <span>·</span>
                  <span>{shortcuts.focus} to search</span>
                  <span>·</span>
                  <span>Wispr Flow: {shortcuts.wisprKey}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
})

export default CaptureCard
