import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play } from 'lucide-react'

export const LOOM_DEMO_URL = 'https://www.loom.com/share/510dc4ac0b5d46c1b9207273ba61be96'
export const LOOM_STORAGE_KEY = 'neko-wispr:dismissed-loom'

/**
 * Official Loom vector logo (asterisk / starburst flower).
 */
export function LoomLogo({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Loom logo"
    >
      <path d="M24 10.665h-7.018l6.078-3.509-1.335-2.312-6.078 3.509 3.508-6.077L16.843.94l-3.508 6.077V0h-2.67v7.018L7.156.94 4.844 2.275l3.509 6.077-6.078-3.508L.94 7.156l6.078 3.509H0v2.67h7.017L.94 16.844l1.335 2.313 6.077-3.508-3.509 6.077 2.312 1.335 3.509-6.078V24h2.67v-7.017l3.508 6.077 2.312-1.335-3.509-6.078 6.078 3.509 1.335-2.313-6.077-3.508h7.017v-2.67H24zm-12 4.966a3.645 3.645 0 1 1 0-7.29 3.645 3.645 0 0 1 0 7.29z" />
    </svg>
  )
}

/**
 * Side docked pull-tab badge with Loom semicircle icon, "Video Demo" notification pill,
 * and direct link to the walkthrough video.
 */
export default function LoomDemoBadge() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LOOM_STORAGE_KEY) === 'true') {
        setDismissed(true)
      }
    } catch {
      /* ignore storage access issues */
    }
  }, [])

  const handleClose = (e) => {
    e.stopPropagation()
    setDismissed(true)
    try {
      sessionStorage.setItem(LOOM_STORAGE_KEY, 'true')
    } catch {
      /* ignore */
    }
  }

  const handleOpen = () => {
    window.open(LOOM_DEMO_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.aside
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.8 }}
          className="fixed left-0 top-[560px] z-[110] pointer-events-auto"
          aria-label="Video demo walkthrough"
        >
          <div
            onClick={handleOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleOpen()
              }
            }}
            title="Watch Loom product demo video (opens in new tab)"
            className="group relative flex items-center gap-2.5 rounded-r-2xl border-y border-r border-indigo-500/25 bg-white/95 py-2 pl-2.5 pr-3 shadow-xl shadow-indigo-500/10 backdrop-blur-xl transition-[transform,border-color,box-shadow] hover:translate-x-1.5 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer dark:border-indigo-400/20 dark:bg-[#140f1f]/95 dark:shadow-black/50"
          >
            {/* Dismiss Cross (X) on left */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Dismiss video demo badge"
              title="Close"
              className="rounded-full p-1 text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700 active:scale-90 cursor-pointer dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-200"
            >
              <X className="size-3" />
            </button>

            {/* Content Details */}
            <div className="flex flex-col items-start gap-0.5">
              {/* Notification Pill */}
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-rose-500" />
                  </span>
                  <span>VIDEO DEMO</span>
                </span>
              </div>

              {/* Action Title */}
              <div className="flex items-center gap-1 font-sans text-xs font-semibold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                <span>See how it works</span>
                <Play className="size-2.5 fill-current text-indigo-500" />
              </div>
            </div>

            {/* Loom Logo Badge on the right */}
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#625df5] text-white shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <LoomLogo size={18} />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
