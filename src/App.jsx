import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { startOfWeek, isSameMonth } from 'date-fns'

import { usePlanner } from './store/usePlanner'
import { parseWithGemini, geminiConfigured } from './lib/gemini'
import { fallbackParse, inferRepeats } from './lib/instant'
import { summarize } from './lib/apply'
import { buildBrief } from './lib/brief'
import { useReminders } from './lib/useReminders'
import { todayKey, shiftKey, fromKey, dayKey, fmtTime, fmtRange } from './lib/dates'

import Rail from './components/Rail'
import Header from './components/Header'
import TopBar from './components/TopBar'
import CaptureCard from './components/CaptureCard'
import HeardYou from './components/HeardYou'
import Toast from './components/Toast'
import FlyLayer from './components/FlyLayer'
import BriefWidget from './components/BriefWidget'
import Onboarding from './components/Onboarding'
import TodayPanel from './sections/TodayPanel'
import DumpPanel from './sections/DumpPanel'
import ProjectsPanel from './sections/ProjectsPanel'
import WrapUpPanel from './sections/WrapUpPanel'
import ScreenPets from './components/ScreenPets'
import WelcomeGate from './components/WelcomeGate'
import { shouldShowWelcomeGate, WELCOME_NAME_STORAGE_KEY, WELCOMED_FLAG_STORAGE_KEY, getAppShortcuts } from './lib/welcome'
import { WisprFlowSymbol } from './components/YapLogo'

const PANEL_COMPONENTS = {
  today: TodayPanel,
  projects: ProjectsPanel,
  dump: DumpPanel,
  wrap: WrapUpPanel,
}

function isVisible(date, anchor, view) {
  if (view === 'month') return isSameMonth(fromKey(date), fromKey(anchor))
  const start = view === 'week' ? dayKey(startOfWeek(fromKey(anchor), { weekStartsOn: 1 })) : anchor
  const days = view === 'day' ? 1 : view === '3day' ? 3 : 7
  return date >= start && date <= shiftKey(start, days - 1)
}

const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

export default function App() {
  const { state, ops, getState } = usePlanner()
  const theme = state.theme || 'light'
  const [panel, setPanelState] = useState('today')
  const [petMode, setPetModeState] = useState(state.prefs.petMode || 'cat')
  const [calView, setCalViewState] = useState(state.prefs.calView || '3day')
  const [anchor, setAnchor] = useState(todayKey())
  const [highlight, setHighlight] = useState(() => new Set())
  const [heard, setHeard] = useState(null)
  const [toast, setToast] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [flights, setFlights] = useState([])
  const [brief, setBrief] = useState(null)
  const reminders = Boolean(state.prefs.reminders)

  const userName =
    state.prefs?.name ||
    (typeof window !== 'undefined' ? localStorage.getItem(WELCOME_NAME_STORAGE_KEY) : '') ||
    'Kishlay'

  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('welcome') === 'true' || window.location.hash === '#welcome') {
        return true
      }
      return shouldShowWelcomeGate()
    } catch {
      return false
    }
  })

  const captureRef = useRef(null)
  const hlTimer = useRef(null)
  const toastTimer = useRef(null)
  const lenisRef = useRef(null)
  const isProgrammaticScroll = useRef(false)
  const scrollProgrammaticTimer = useRef(null)

  const setPetMode = (m) => {
    setPetModeState(m)
    ops.setPref('petMode', m)
  }

  const scrollToSection = useCallback(
    (id, updateHash = true) => {
      if (!id || typeof window === 'undefined') return
      const cleanId = id.replace('#', '')
      setPanelState(cleanId)
      ops.setPref('panel', cleanId)
      if (updateHash && window.location.hash !== `#${cleanId}`) {
        window.history.replaceState(null, '', `#${cleanId}`)
      }

      isProgrammaticScroll.current = true
      clearTimeout(scrollProgrammaticTimer.current)
      scrollProgrammaticTimer.current = setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 1600)

      const onDone = () => {
        clearTimeout(scrollProgrammaticTimer.current)
        isProgrammaticScroll.current = false
        setPanelState(cleanId)
      }

      if (cleanId === 'today') {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, {
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            onComplete: onDone,
          })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setTimeout(onDone, 600)
        }
        return
      }

      const el = document.getElementById(cleanId)
      if (el) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el, {
            offset: -80,
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            onComplete: onDone,
          })
        } else {
          const y = el.getBoundingClientRect().top + window.scrollY - 80
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
          setTimeout(onDone, 600)
        }
      }
    },
    [ops],
  )

  const setPanel = scrollToSection

  // Responsive liquid Lenis inertia and zero-lag scroll spy
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4,
      autoRaf: true,
    })

    lenisRef.current = lenis

    const ids = ['today', 'projects', 'dump', 'wrap']

    const updateActiveSection = () => {
      if (isProgrammaticScroll.current) return

      const scrollY = lenis.scroll ?? window.scrollY ?? window.pageYOffset ?? 0
      const winHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight

      // Only if scrolled to the absolute bottom of the document (within 20px of end)
      // should the final section ('wrap') be forced
      const isScrollable = docHeight > winHeight + 60
      if (isScrollable && scrollY + winHeight >= docHeight - 20) {
        setPanelState((prev) => (prev !== 'wrap' ? 'wrap' : prev))
        return
      }

      // Check sections from top to bottom
      // A section [rect.top, rect.bottom] is active if rect.top <= focusY && rect.bottom > focusY
      const focusY = Math.max(100, Math.min(180, winHeight * 0.22))
      let activeId = null

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= focusY && rect.bottom > focusY) {
          activeId = id
          break
        }
      }

      if (!activeId) {
        // Fallback for inter-section gaps: take the last section whose top has reached focusY
        for (const id of ids) {
          const el = document.getElementById(id)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          if (rect.top <= focusY) {
            activeId = id
          }
        }
      }

      const targetId = activeId || 'today'
      setPanelState((prev) => (prev !== targetId ? targetId : prev))
    }

    // Hook Lenis scroll events directly into the scroll spy for zero lag on every frame
    const unbindLenis = lenis.on('scroll', updateActiveSection)

    // Listen to native scroll and resize for immediate sync
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection, { passive: true })

    // Cancel programmatic lock if user manually takes over scrolling
    const cancelProgrammatic = () => {
      if (isProgrammaticScroll.current) {
        isProgrammaticScroll.current = false
        clearTimeout(scrollProgrammaticTimer.current)
      }
    }
    window.addEventListener('wheel', cancelProgrammatic, { passive: true })
    window.addEventListener('touchstart', cancelProgrammatic, { passive: true })

    // Initial check on mount
    updateActiveSection()

    return () => {
      unbindLenis?.()
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
      window.removeEventListener('wheel', cancelProgrammatic)
      window.removeEventListener('touchstart', cancelProgrammatic)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Hash route listener (back/forward button support)
  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '')
      if (h && ['today', 'projects', 'dump', 'wrap'].includes(h)) {
        scrollToSection(h, false)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [scrollToSection])

  // Always present the top of the website on initial load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
    lenisRef.current?.scrollTo(0, { immediate: true })
    if (window.location.hash && window.location.hash !== '#today') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const setCalView = (v) => {
    setCalViewState(v)
    ops.setPref('calView', v)
  }

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const lastUndoRef = useRef(0)
  const showToast = useCallback((text, tone = 'ok', undo = false) => {
    clearTimeout(toastTimer.current)
    setToast((prev) => {
      if (prev && prev.text === text && prev.tone === tone && prev.undo === undo) {
        return prev
      }
      return { id: Date.now(), text, tone, undo }
    })
    toastTimer.current = setTimeout(() => setToast(null), undo ? 6500 : 4500)
  }, [])

  const flash = useCallback((ids) => {
    clearTimeout(hlTimer.current)
    setHighlight(new Set(ids))
    hlTimer.current = setTimeout(() => setHighlight(new Set()), 2800)
  }, [])

  const jumpTo = useCallback(
    (date) => {
      if (!date) return
      setAnchor((a) => (isVisible(date, a, calView) ? a : date))
    },
    [calView],
  )

  const undo = useCallback(() => {
    const now = Date.now()
    if (now - lastUndoRef.current < 200) return
    lastUndoRef.current = now
    if (ops.undo()) {
      setHeard(null)
      setHighlight(new Set())
      showToast('Undone. Back to how it was.')
    } else showToast('Nothing to undo.', 'warn')
  }, [ops, showToast])

  const handleWelcomeComplete = useCallback(
    (enteredName) => {
      const finalName = enteredName?.trim() || 'Kishlay'
      ops.setPref('name', finalName)
      try {
        localStorage.setItem(WELCOME_NAME_STORAGE_KEY, finalName)
        localStorage.setItem(WELCOMED_FLAG_STORAGE_KEY, 'true')
      } catch {
        /* storage full or blocked */
      }
      setShowWelcome(false)
      showToast(`Welcome, ${finalName}! Step into your daily flow.`, 'ok')
    },
    [ops, showToast],
  )

  const handleWelcomeClose = useCallback(() => {
    try {
      localStorage.setItem(WELCOMED_FLAG_STORAGE_KEY, 'true')
    } catch {
      /* storage full or blocked */
    }
    setShowWelcome(false)
  }, [])

  // ⌘K focus · ⌘Z undo (when not typing)
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        captureRef.current?.focus()
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        const el = document.activeElement
        if (isTyping(el) && el.value) return
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo])

  const handleSubmit = useCallback(
    async (text) => {
      setProcessing(true)
      const t0 = performance.now()
      let result
      try {
        if (!geminiConfigured) throw new Error('No Gemini key in .env.local')
        result = await parseWithGemini(text, getState())
        if (!result.actions.length) throw new Error('Gemini returned no actions')
        result.source = 'gemini'
      } catch (err) {
        console.warn('[yap] using offline parser:', err.message)
        result = { actions: fallbackParse(text, getState()), ms: Math.round(performance.now() - t0), model: 'offline', source: 'offline' }
      }

      try {
        const applied = ops.apply(inferRepeats(text, result.actions))
        setHeard({ id: Date.now(), applied, ms: result.ms, model: result.model, source: result.source, canUndo: true })
        showToast(summarize(applied) + (result.source === 'offline' ? ' (offline guess)' : ''), result.source === 'offline' || applied.some((a) => a.warning) ? 'warn' : 'ok', applied.length > 0)
        flash(applied.flatMap((a) => a.ids || (a.id ? [a.id] : [])))
        jumpTo(applied.find((a) => a.date)?.date)

        // Signature: chips fly from the input to where each item landed
        const r = captureRef.current?.getRect?.()
        if (r) {
          const from = { x: r.left + Math.min(r.width * 0.25, 260), y: r.top + Math.min(r.height / 2, 40) }
          setFlights(
            applied
              .filter((a) => a.id && a.verb !== 'Removed')
              .slice(0, 6)
              .map((a, i) => ({ key: `${Date.now()}-${i}`, id: a.id, kind: a.kind, tone: a.tone, label: a.label.length > 34 ? a.label.slice(0, 32) + '…' : a.label, from })),
          )
        }
      } finally {
        setProcessing(false)
      }
      return true
    },
    [getState, ops, showToast, flash, jumpTo],
  )

  const onChipClick = (a) => {
    const ids = a.ids || (a.id ? [a.id] : [])
    if (ids.length) flash(ids)
    if (a.date) {
      setAnchor((cur) => (isVisible(a.date, cur, calView) ? cur : a.date))
      scrollToSection('today')
    } else if (a.kind === 'project') {
      scrollToSection('projects')
    } else if (a.kind === 'idea') {
      scrollToSection('dump')
    } else if (a.kind === 'todo') {
      scrollToSection('today')
    }
  }

  const onBrief = (mode) => setBrief(buildBrief(getState(), mode, userName))

  const demoClickRef = useRef(0)
  const onDemo = () => {
    const now = Date.now()
    if (now - demoClickRef.current < 400) return
    demoClickRef.current = now
    ops.loadDemo()
    setAnchor(todayKey())
    showToast('Demo data loaded. Try: "Meeting with Kishlay at 3:30, fest project is at risk"', 'ok', true)
  }

  // Reminders: browser notification + in-app toast 10 min before each event
  const reminderClickRef = useRef(0)
  const toggleReminders = async () => {
    const now = Date.now()
    if (now - reminderClickRef.current < 400) return
    reminderClickRef.current = now
    if (reminders) {
      ops.setPref('reminders', false)
      return showToast('Reminders off.')
    }
    let permission = 'unsupported'
    if ('Notification' in window) permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission
    ops.setPref('reminders', true)
    if (permission === 'granted') {
      new Notification('neko- wispr ai-productivity app reminders on 🔔', { body: "I'll ping you 10 minutes before each event." })
      showToast("Reminders on. I'll ping you 10 min before each event.")
    } else showToast('Reminders on (in-app only: browser notifications are blocked).', 'warn')
  }
  useReminders(state.events, reminders, (e, mins) => {
    const body = `${fmtRange(e.start, e.end)} · in ${mins} min`
    if ('Notification' in window && Notification.permission === 'granted') new Notification(`${e.emoji || '⏰'} ${e.title}`, { body })
    showToast(`⏰ ${e.title} starts at ${fmtTime(e.start)}, in ${mins} min`, 'warn')
    flash([e.id])
    jumpTo(e.date)
  })

  const shortcuts = useMemo(() => getAppShortcuts(), [])

  const badges = useMemo(
    () => ({
      dump: state.ideas.length + state.todos.filter((t) => !t.done && !t.date && !t.projectId).length,
      today: state.todos.filter((t) => !t.done && t.date === todayKey()).length,
    }),
    [state],
  )

  const panelOps = useMemo(
    () => ({
      ...ops,
      closeDay: () => {
        const n = ops.closeDay()
        showToast(n ? `Carried ${n} to tomorrow. Good night!` : 'Nothing to carry. Clean day!', 'ok', n > 0)
        return n
      },
      deleteItem: (id) => {
        ops.deleteItem(id)
        showToast('Deleted.', 'ok', true)
      },
    }),
    [ops, showToast],
  )

  const calendarOps = useMemo(
    () => ({
      ...ops,
      updateEvent: (id, fields) => {
        const clash = ops.updateEvent(id, fields)
        if (clash) showToast(`Heads up: overlaps ${clash.title} (${fmtRange(clash.start, clash.end)})`, 'warn')
        return clash
      },
      deleteItem: (id) => {
        ops.deleteItem(id)
        showToast('Event deleted.', 'ok', true)
      },
      deleteSeries: (seriesId) => {
        ops.deleteSeries(seriesId)
        showToast('Whole series deleted.', 'ok', true)
      },
    }),
    [ops, showToast],
  )

  const isEmpty = !state.events.length && !state.todos.length && !state.projects.length && !state.ideas.length
  const Panel = PANEL_COMPONENTS[panel] || TodayPanel

  return (
    <>
      {/* GPU-composited ambient backdrop for silky 120fps fluid scrolling */}
      <div className="bg-ambient" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />

      <div className="mx-auto flex max-w-[1320px] gap-6 px-4 pb-40 pt-6 sm:px-6 lg:pb-32 lg:pt-8">
      <Rail panel={panel} setPanel={setPanel} theme={theme} toggleTheme={() => ops.setTheme(theme === 'dark' ? 'light' : 'dark')} badges={badges} />

      <main className="min-w-0 flex-1 space-y-4">
        <TopBar name={userName} panel={panel} petMode={petMode} setPetMode={setPetMode} onOpenWelcome={() => setShowWelcome(true)} />

        {/* Persistent Sticky Command Palette */}
        <CaptureCard ref={captureRef} onSubmit={handleSubmit} processing={processing} projects={state.projects} />

        {/* Editorial Page Header & Daily Stats (shown on Today or collapsed on others) */}
        <Header state={state} onDemo={onDemo} onBrief={onBrief} reminders={reminders} onToggleReminders={toggleReminders} name={userName} onOpenWelcome={() => setShowWelcome(true)} />

        {!geminiConfigured && (
          <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 px-4 py-2 text-sm text-pink-800 dark:text-pink-200">
            Gemini key missing: add <code className="font-mono">VITE_GEMINI_API_KEY</code> to <code className="font-mono">.env.local</code> and restart. Using offline chrono parser.
          </div>
        )}

        <HeardYou heard={heard} onChipClick={onChipClick} onUndo={undo} />

        <AnimatePresence>
          {isEmpty && !processing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0 }}>
              <Onboarding onTry={(t) => captureRef.current?.run(t)} onDemo={onDemo} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continuous Single-Page Bento Layout with Smooth Section Navigation */}
        <div className="space-y-12 pt-2">
          <section id="today">
            <TodayPanel
              state={state}
              ops={panelOps}
              highlight={highlight}
              anchor={anchor}
              setAnchor={setAnchor}
              calView={calView}
              setCalView={setCalView}
              calendarOps={calendarOps}
            />
          </section>

          <section id="projects">
            <ProjectsPanel state={state} ops={panelOps} highlight={highlight} />
          </section>

          <section id="dump">
            <DumpPanel state={state} ops={panelOps} highlight={highlight} />
          </section>

          <section id="wrap">
            <WrapUpPanel state={state} ops={panelOps} highlight={highlight} />
          </section>
        </div>

        <footer className="space-y-2 pt-8 text-center text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 px-2.5 py-0.5 font-medium text-pink-700 dark:border-sky-400/20 dark:text-sky-300">
              <WisprFlowSymbol size={11} /> Powered by Wispr Flow and Google Gemini
            </span>
            <span className="hidden opacity-30 sm:inline">·</span>
            <span>
              Voice-First Daily Planning
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
            <span className="font-mono">{shortcuts.footerText}</span>
            <span className="opacity-40">·</span>
            <ClearButton
              onClear={() => {
                ops.clearAll()
                setHeard(null)
                showToast('Cleared. Fresh start.', 'ok', true)
              }}
            />
          </div>
        </footer>
      </main>
    </div>

    <Toast toast={toast} onUndo={undo} raised={Boolean(brief)} />
    <FlyLayer flights={flights} onDone={(key) => setFlights((fs) => fs.filter((f) => f.key !== key))} />
    <BriefWidget
      brief={brief}
      state={state}
      onClose={() => setBrief(null)}
      onChangeMode={onBrief}
    />
    <ScreenPets petMode={petMode} />

    <AnimatePresence>
      {showWelcome && (
        <WelcomeGate
          initialName={state.prefs?.name || ''}
          onComplete={handleWelcomeComplete}
          onClose={handleWelcomeClose}
          canClose={Boolean(state.prefs?.name || (typeof window !== 'undefined' && localStorage.getItem(WELCOME_NAME_STORAGE_KEY)))}
          theme={theme}
          onToggleTheme={() => ops.setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      )}
    </AnimatePresence>
  </>
)
}

// Two-step clear (no blocking confirm dialog)
function ClearButton({ onClear }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(t)
  }, [armed])
  return (
    <button
      type="button"
      onClick={() => (armed ? (onClear(), setArmed(false)) : setArmed(true))}
      className={`font-mono transition ${armed ? 'text-rose-500' : 'hover:text-zinc-800 dark:hover:text-zinc-200'}`}
    >
      {armed ? 'click again to clear everything' : 'clear all'}
    </button>
  )
}
