import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Mic, Sparkles, X, CheckCircle2 } from 'lucide-react'

/**
 * Official Wispr Flow 5-bar soundwave symbol (vector-exact from Wispr Flow Media Kit).
 */
export function WisprFlowSymbol({ size = 20, className = '', color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 126 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Wispr Flow icon"
    >
      <path
        d="M8.98429 0C4.02176 0 0 4.01378 0 8.96647V115.286C0 120.239 4.02176 124.252 8.98429 124.252C13.9468 124.252 17.9686 120.239 17.9686 115.286V8.96647C17.9686 4.01378 13.9468 0 8.98429 0Z"
        fill={color}
      />
      <path
        d="M62.9645 20.3242C58.002 20.3242 53.9802 24.338 53.9802 29.2907V94.1185C53.9802 99.0712 58.002 103.085 62.9645 103.085C67.9271 103.085 71.9488 99.0712 71.9488 94.1185V29.2907C71.9488 24.338 67.9271 20.3242 62.9645 20.3242Z"
        fill={color}
      />
      <path
        d="M35.976 56.9092C31.0135 56.9092 26.9917 60.923 26.9917 65.8756V102.832C26.9917 107.785 31.0135 111.799 35.976 111.799C40.9385 111.799 44.9603 107.785 44.9603 102.832V65.8756C44.9603 60.923 40.9385 56.9092 35.976 56.9092Z"
        fill={color}
      />
      <path
        d="M116.943 0C111.981 0 107.959 4.01378 107.959 8.96647V115.286C107.959 120.239 111.981 124.252 116.943 124.252C121.906 124.252 125.928 120.239 125.928 115.286V8.96647C125.928 4.01378 121.906 0 116.943 0Z"
        fill={color}
      />
      <path
        d="M89.9546 56.9092C84.9921 56.9092 80.9703 60.923 80.9703 65.8756V102.832C80.9703 107.785 84.9921 111.799 89.9546 111.799C94.9172 111.799 98.9389 107.785 98.9389 102.832V65.8756C98.9389 60.923 94.9172 56.9092 89.9546 56.9092Z"
        fill={color}
      />
    </svg>
  )
}

/**
 * Official Wispr Flow full logotype (Waveform symbol + FLOW lettering).
 */
export function WisprFlowFullLogo({ height = 18, className = '', color = 'currentColor' }) {
  return (
    <svg
      height={height}
      viewBox="0 0 446 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Wispr Flow logo"
      style={{ width: 'auto', display: 'inline-block' }}
    >
      <path
        d="M8.98429 0C4.02176 0 0 4.01378 0 8.96647V115.286C0 120.239 4.02176 124.252 8.98429 124.252C13.9468 124.252 17.9686 120.239 17.9686 115.286V8.96647C17.9686 4.01378 13.9468 0 8.98429 0Z"
        fill={color}
      />
      <path
        d="M62.9645 20.3242C58.002 20.3242 53.9802 24.338 53.9802 29.2907V94.1185C53.9802 99.0712 58.002 103.085 62.9645 103.085C67.9271 103.085 71.9488 99.0712 71.9488 94.1185V29.2907C71.9488 24.338 67.9271 20.3242 62.9645 20.3242Z"
        fill={color}
      />
      <path
        d="M35.976 56.9092C31.0135 56.9092 26.9917 60.923 26.9917 65.8756V102.832C26.9917 107.785 31.0135 111.799 35.976 111.799C40.9385 111.799 44.9603 107.785 44.9603 102.832V65.8756C44.9603 60.923 40.9385 56.9092 35.976 56.9092Z"
        fill={color}
      />
      <path
        d="M116.943 0C111.981 0 107.959 4.01378 107.959 8.96647V115.286C107.959 120.239 111.981 124.252 116.943 124.252C121.906 124.252 125.928 120.239 125.928 115.286V8.96647C125.928 4.01378 121.906 0 116.943 0Z"
        fill={color}
      />
      <path
        d="M89.9546 56.9092C84.9921 56.9092 80.9703 60.923 80.9703 65.8756V102.832C80.9703 107.785 84.9921 111.799 89.9546 111.799C94.9172 111.799 98.9389 107.785 98.9389 102.832V65.8756C98.9389 60.923 94.9172 56.9092 89.9546 56.9092Z"
        fill={color}
      />
      <path
        d="M230.13 72.15H191.53V108.77H171V15H230.68V34.01H191.52V53.65H230.12V72.15H230.13Z"
        fill={color}
      />
      <path
        d="M269.1 91.54H260.15C258.4 91.54 256.98 90.12 256.98 88.37V15H237.47V96.6C237.47 103.32 242.92 108.77 249.64 108.77H256.99H269.11V91.54H269.1Z"
        fill={color}
      />
      <path
        d="M272.51 76.0299C272.51 55.4399 287.62 41.6299 308.47 41.6299C329.32 41.6299 344.3 55.4399 344.3 76.0299C344.3 96.6199 329.19 110.3 308.47 110.3C287.75 110.3 272.51 96.6199 272.51 76.0299ZM292.7 75.8999C292.7 85.7999 299.08 92.3199 308.47 92.3199C317.86 92.3199 324.11 85.8099 324.11 75.8999C324.11 65.9899 317.73 59.6099 308.47 59.6099C299.21 59.6099 292.7 66.1199 292.7 75.8999Z"
        fill={color}
      />
      <path
        d="M363.109 108.35L342.66 43.3501H363.235L369.075 64.5384C370.602 70.1299 371.995 76.5033 373.01 82.9954C374.151 76.1074 374.789 73.6333 377.583 64.5384L384.061 43.3501H404.123L410.089 64.5384C410.727 66.7453 413.773 78.8388 414.411 82.9954C415.175 78.3143 418.22 66.874 418.858 64.5384L424.959 43.3501H445.66L423.432 108.35H405.274L399.173 87.6764C396.002 77.0179 394.348 69.3481 393.962 66.6167C393.449 69.3481 392.308 74.4151 388.248 88.0623L382.156 108.34H363.109V108.35Z"
        fill={color}
      />
    </svg>
  )
}

/**
 * Co-branded Yap It Done Logo:
 * Bento squircle with radiant gradient housing the authentic Wispr Flow waveform + lightning spark.
 */
export function YapLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Wispr Flow logo"
    >
      {/* Solid pink background squircle */}
      <rect width="48" height="48" rx="13" fill="#ec4899" />

      {/* Official Wispr Flow 5-Bar Waveform in clean crisp white */}
      <g transform="translate(10, 10.1) scale(0.222)" fill="#FFFFFF">
        <path d="M8.98429 0C4.02176 0 0 4.01378 0 8.96647V115.286C0 120.239 4.02176 124.252 8.98429 124.252C13.9468 124.252 17.9686 120.239 17.9686 115.286V8.96647C17.9686 4.01378 13.9468 0 8.98429 0Z" />
        <path d="M62.9645 20.3242C58.002 20.3242 53.9802 24.338 53.9802 29.2907V94.1185C53.9802 99.0712 58.002 103.085 62.9645 103.085C67.9271 103.085 71.9488 99.0712 71.9488 94.1185V29.2907C71.9488 24.338 67.9271 20.3242 62.9645 20.3242Z" />
        <path d="M35.976 56.9092C31.0135 56.9092 26.9917 60.923 26.9917 65.8756V102.832C26.9917 107.785 31.0135 111.799 35.976 111.799C40.9385 111.799 44.9603 107.785 44.9603 102.832V65.8756C44.9603 60.923 40.9385 56.9092 35.976 56.9092Z" />
        <path d="M116.943 0C111.981 0 107.959 4.01378 107.959 8.96647V115.286C107.959 120.239 111.981 124.252 116.943 124.252C121.906 124.252 125.928 120.239 125.928 115.286V8.96647C125.928 4.01378 121.906 0 116.943 0Z" />
        <path d="M89.9546 56.9092C84.9921 56.9092 80.9703 60.923 80.9703 65.8756V102.832C80.9703 107.785 84.9921 111.799 89.9546 111.799C94.9172 111.799 98.9389 107.785 98.9389 102.832V65.8756C98.9389 60.923 94.9172 56.9092 89.9546 56.9092Z" />
      </g>
    </svg>
  )
}

/**
 * Co-branded Wordmark displaying Yap It Done × Wispr Flow.
 */
export function YapWordmark({ className = '', onWisprClick }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <YapLogo size={28} />
      <div className="flex items-center gap-1.5 font-sans">
        <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
          neko<span className="text-pink-500 dark:text-pink-400">-</span>wispr
        </span>
        <span className="text-xs text-zinc-400">×</span>
        <button
          type="button"
          onClick={onWisprClick}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-zinc-700 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
          title="Learn how Wispr Flow powers this planner"
        >
          <WisprFlowSymbol size={13} className="text-zinc-900 dark:text-white" />
          <span>Wispr Flow</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Clickable Hackathon Badge Pill for TopBar or Rail.
 */
export function PoweredByBadge({ className = '', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 rounded-full border border-pink-500/25 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-pink-700 backdrop-blur-md transition hover:border-pink-500/40 hover:bg-pink-500/20 active:scale-95 dark:border-sky-400/25 dark:text-sky-300 dark:hover:border-sky-400/40 ${className}`}
      title="Powered by Wispr Flow and Google Gemini"
    >
      <WisprFlowSymbol size={12} className="shrink-0 transition-transform group-hover:scale-110" />
      <span className="tracking-tight">Powered by Wispr Flow & Google Gemini</span>
    </button>
  )
}

export const WisprHackathonBadge = PoweredByBadge

/**
 * Interactive Modal showcasing how Wispr Flow powers Yap It Done.
 */
export function WisprFlowModal({ open, onClose }) {
  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#140f1f]/95 dark:text-zinc-100"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          >
            <X className="size-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md dark:bg-white dark:text-zinc-950">
              <WisprFlowSymbol size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Wispr Flow
                </span>
                <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-semibold text-pink-600 dark:bg-sky-400/15 dark:text-sky-300">
                  + Google Gemini
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Voice-First AI Planner powered by Wispr Flow and Google Gemini
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="mt-5 space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4 dark:border-sky-500/20 dark:bg-sky-500/5">
              <div className="flex items-center gap-2 font-semibold text-pink-700 dark:text-sky-300">
                <Sparkles className="size-4" />
                <span>Why Voice-First Daily Planning?</span>
              </div>
              <p className="mt-1.5">
                Traditional planners force you to manually type, pick dates, set time dropdowns, and organize folders. With <b>Wispr Flow</b>, you simply hold your hotkey, yap out what’s on your mind in natural speech, and our AI pipeline turns it into time-blocked events and smart to-dos in seconds.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-semibold uppercase tracking-wider text-zinc-400 text-[10px]">
                How Wispr Flow powers neko- wispr ai-productivity app:
              </h4>

              <div className="flex gap-3">
                <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-pink-500/10 text-pink-600 dark:bg-sky-500/10 dark:text-sky-300">
                  <Mic className="size-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                    1. Dictate Anywhere
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Press your Wispr Flow shortcut (Fn / Option key) anywhere in your OS or web browser to yap directly into the sticky command palette.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-pink-500/10 text-pink-600 dark:bg-sky-500/10 dark:text-sky-300">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                    2. Instant Filler & Noise Removal
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Wispr Flow automatically cleans up pauses, false starts, and filler words, streaming clean text to our instant chrono-parser.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-pink-500/10 text-pink-600 dark:bg-sky-500/10 dark:text-sky-300">
                  <Sparkles className="size-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                    3. Intelligent Auto-Organization
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Gemini 1.5 categorizes your speech into Today’s Plate, Studio Calendar, Brain Dump, or Projects Hub with zero manual sorting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action links */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 dark:border-white/10">
            <a
              href="https://wisprflow.ai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:underline dark:text-sky-400"
            >
              <span>Visit wisprflow.ai</span>
              <ExternalLink className="size-3" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
