import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Sparkles, ChevronDown, Sun, Moon, Clock, Bell, BellOff } from 'lucide-react'
import SplitText from './SplitText'
import { todayKey, toMin, fmtTime, nowMin } from '../lib/dates'

function Chip({ dot, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-[13px] text-zinc-600 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
      {dot && <span className={`size-1.5 rounded-full ${dot}`} />}
      {children}
    </span>
  )
}

import { getBriefStats } from '../lib/brief'

export function dayStats(state) {
  return getBriefStats(state)
}

const BRIEFS = [
  { mode: 'now', label: 'Rest of today', hint: 'What’s still pending', icon: Clock },
  { mode: 'morning', label: 'Morning brief', hint: 'Plan for the whole day', icon: Sun },
  { mode: 'evening', label: 'Evening wrap', hint: 'Done, carry over, tomorrow', icon: Moon },
]

function BriefButton({ onBrief, open, setOpen }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open, setOpen])

  return (
    <div ref={ref} className="relative z-50 inline-flex items-center rounded-xl bg-zinc-900 shadow-md shadow-black/15 transition hover:shadow-lg dark:bg-white dark:shadow-none">
      <button
        type="button"
        onClick={() => onBrief('now')}
        className="inline-flex items-center gap-2 rounded-l-xl py-2 pl-4 pr-3 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.98] dark:text-zinc-900 dark:hover:bg-black/5"
      >
        <Volume2 className="size-4" /> Brief me
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose brief"
        className="rounded-r-xl border-l border-white/15 py-2 px-2.5 text-white transition hover:bg-white/10 active:scale-[0.98] dark:border-zinc-900/15 dark:text-zinc-900 dark:hover:bg-black/5"
      >
        <ChevronDown className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[70] mt-2 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95"
          >
            {BRIEFS.map(({ mode, label, hint, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setOpen(false)
                  onBrief(mode)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-300">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
                  <span className="block text-xs text-zinc-500">{hint}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Header({ state, onDemo, onBrief, reminders, onToggleReminders, name = 'Kishlay', onOpenWelcome }) {
  const [briefOpen, setBriefOpen] = useState(false)
  const stats = useMemo(() => dayStats(state), [state])
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className={`relative ${briefOpen ? 'z-50' : 'z-20'} flex flex-col gap-3 rounded-2xl border border-black/[0.05] bg-white/50 px-4 py-2.5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-white/[0.02]`}>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-serif text-lg tracking-tight text-zinc-900 sm:text-xl dark:text-zinc-50">
          {greeting},{' '}
          {onOpenWelcome ? (
            <button
              type="button"
              onClick={onOpenWelcome}
              title="Change name or whisper your name again"
              className="italic text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 cursor-pointer transition"
            >
              {name}
            </button>
          ) : (
            <span className="italic text-pink-500 dark:text-pink-400">{name}</span>
          )}{' '}
          ✨
        </span>
        <div className="hidden h-3.5 w-px bg-black/10 sm:block dark:bg-white/10" />
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-sky-700 dark:text-sky-300">
            <span className="size-1.5 rounded-full bg-sky-400" />
            <b>{stats.events.length}</b> events
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 text-pink-700 dark:text-pink-300">
            <span className="size-1.5 rounded-full bg-pink-400" />
            <b>{stats.todos.length}</b> to-dos
          </span>
          {stats.risky.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-rose-700 dark:text-rose-300">
              <span className="size-1.5 rounded-full bg-rose-400" />
              <b>{stats.risky.length}</b> at risk
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
            {stats.free}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleReminders}
          title={reminders ? 'Reminders active' : 'Enable event reminders'}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs backdrop-blur transition ${
            reminders
              ? 'border-pink-400/50 bg-pink-500/10 text-pink-700 dark:text-pink-300'
              : 'border-black/10 bg-white/60 text-zinc-600 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300'
          }`}
        >
          {reminders ? <Bell className="size-3.5 text-pink-500" /> : <BellOff className="size-3.5" />}
          <span className="hidden md:inline">{reminders ? 'Reminders on' : 'Reminders'}</span>
        </button>

        <button
          type="button"
          onClick={onDemo}
          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white/60 px-2.5 py-1 text-xs text-zinc-700 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200"
        >
          <Sparkles className="size-3.5 text-sky-500" />
          <span className="hidden md:inline">Demo</span>
        </button>

        <BriefButton onBrief={onBrief} open={briefOpen} setOpen={setBriefOpen} />
      </div>
    </header>
  )
}
