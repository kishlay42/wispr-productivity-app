import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { PetToggle } from './ScreenPets'
import { PoweredByBadge, WisprFlowModal } from './YapLogo'

// 16×12 pixel cat. O outline · W fur · P pink · E eye · S shine · N nose · M mouth
const CAT_OPEN = [
  '.O............O.',
  '.OO..........OO.',
  '.OPO........OPO.',
  '.OPPOOOOOOOOPPO.',
  'OWWWWWWWWWWWWWWO',
  'OWWWWWWWWWWWWWWO',
  'OWWSEWWWWWWSEWWO',
  'OWWEEWWWWWWEEWWO',
  'OWPPWWWNNWWWPPWO',
  'OWWWWWMWWMWWWWWO',
  '.OWWWWWWWWWWWWO.',
  '..OOOOOOOOOOOO..',
]
const CAT_CLOSED = CAT_OPEN.map((row, i) => (i === 6 || i === 7 ? row.replace(/[SE]/g, 'W') : row))
const CAT_COLORS = {
  O: 'var(--cat-o)',
  W: 'var(--cat-w)',
  P: 'var(--cat-p)',
  E: 'var(--cat-e)',
  S: 'var(--cat-s)',
  N: 'var(--cat-n)',
  M: 'var(--cat-m)',
}
const CAT_LINES = ['meow!', 'yap it!', 'purr~', 'nyaa', 'done?', '♥']

// 16×14 pixel Tux Penguin (extracted & stylized from aaditya-dakhore/tux-pet-js)
// O outline · K body plumage · W white belly/patch · E pupil · S shine · Y beak · G gold/shadow · P blush · F orange feet
const TUX_OPEN = [
  '.....OOOOOO.....',
  '...OOKKKKKKOO...',
  '..OKKWWKKWWKKO..',
  '..OKWSEKKSEWKO..',
  '..OKWEEKKEEWKO..',
  '..OKPYYYYYYPKO..',
  '...OKKGGGGKKO...',
  '.OOKKWWWWWWKKOO.',
  'OKKKWWWWWWWWKKKO',
  'OKKKWWWWWWWWKKKO',
  '.OKKWWWWWWWWKKO.',
  '..OOKKKKKKKKOO..',
  '...FFFF..FFFF...',
  '..FFFFF..FFFFF..',
]

const TUX_CLOSED = TUX_OPEN.map((row, i) => {
  if (i === 3) return '..OKWWKKKKWWKO..'
  if (i === 4) return '..OKWOOKKOOWKO..'
  return row
})

const TUX_FLAP = [
  '.....OOOOOO.....',
  '...OOKKKKKKOO...',
  '..OKKWWKKWWKKO..',
  '..OKWSEKKSEWKO..',
  '..OKWEEKKEEWKO..',
  '..OKPYYYYYYPKO..',
  'OOKKKKGGGGKKOOKK',
  '.OOKKWWWWWWKKOO.',
  '..OKWWWWWWWWKO..',
  '..OKWWWWWWWWKO..',
  '.OKKWWWWWWWWKKO.',
  '..OOKKKKKKKKOO..',
  '...FFFF..FFFF...',
  '..FFFFF..FFFFF..',
]

const TUX_COLORS = {
  O: '#09090b', // dark outline
  K: '#18181b', // Tux black body/wings
  W: '#f8fafc', // crisp white belly & eye patch
  E: '#09090b', // eye pupil
  S: '#ffffff', // eye shine
  Y: '#facc15', // yellow beak
  G: '#eab308', // beak gold shadow
  P: '#fda4af', // pink blush
  F: '#ea580c', // orange penguin feet
}

const TUX_LINES = ['noot noot!', 'waddle~', 'linux!', 'get it done!', 'brrr~', '♥']
const DUO_LINES = ['besties!', 'paw & flipper!', 'neko duo!', 'get it done!', 'purr & noot!', '♥']

export function PixelCat({ blinking, width = 48, height = 36 }) {
  const grid = blinking ? CAT_CLOSED : CAT_OPEN
  return (
    <svg viewBox="0 0 16 12" width={width} height={height} shapeRendering="crispEdges" aria-hidden="true">
      {grid.flatMap((row, y) =>
        [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={CAT_COLORS[c]} />)),
      )}
    </svg>
  )
}

export function PixelTux({ blinking, flapping, width = 48, height = 42 }) {
  const grid = blinking ? TUX_CLOSED : flapping ? TUX_FLAP : TUX_OPEN
  return (
    <svg viewBox="0 0 16 14" width={width} height={height} shapeRendering="crispEdges" aria-hidden="true">
      {grid.flatMap((row, y) =>
        [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={TUX_COLORS[c]} />)),
      )}
    </svg>
  )
}

export function TopBarPet({ petMode = 'cat' }) {
  if (petMode === 'none') return null

  const [catBlinking, setCatBlinking] = useState(false)
  const [tuxBlinking, setTuxBlinking] = useState(false)
  const [tuxFlapping, setTuxFlapping] = useState(false)
  const [hop, setHop] = useState(0)
  const [bubble, setBubble] = useState(null)
  const timers = useRef([])

  const blinkCat = (ms = 170) => {
    setCatBlinking(true)
    timers.current.push(setTimeout(() => setCatBlinking(false), ms))
  }

  const blinkTux = (ms = 180) => {
    setTuxBlinking(true)
    timers.current.push(setTimeout(() => setTuxBlinking(false), ms))
  }

  // Idle blinks
  useEffect(() => {
    if (petMode === 'none') return

    let catTimer
    let tuxTimer

    const loopCat = () => {
      catTimer = setTimeout(() => {
        blinkCat()
        loopCat()
      }, 2600 + Math.random() * 3000)
    }

    const loopTux = () => {
      tuxTimer = setTimeout(() => {
        blinkTux()
        loopTux()
      }, 3000 + Math.random() * 3200)
    }

    if (petMode === 'cat' || petMode === 'duo') loopCat()
    if (petMode === 'tux' || petMode === 'duo') loopTux()

    return () => {
      clearTimeout(catTimer)
      clearTimeout(tuxTimer)
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [petMode])

  const onTap = () => {
    setHop((h) => h + 1)

    if (petMode === 'cat') {
      blinkCat(220)
      timers.current.push(setTimeout(() => blinkCat(140), 380))
      setBubble({ id: Date.now(), text: CAT_LINES[Math.floor(Math.random() * CAT_LINES.length)], theme: 'cat' })
    } else if (petMode === 'tux') {
      blinkTux(220)
      timers.current.push(setTimeout(() => blinkTux(140), 380))
      setTuxFlapping(true)
      timers.current.push(setTimeout(() => setTuxFlapping(false), 380))
      setBubble({ id: Date.now(), text: TUX_LINES[Math.floor(Math.random() * TUX_LINES.length)], theme: 'tux' })
    } else if (petMode === 'duo') {
      blinkCat(200)
      blinkTux(200)
      timers.current.push(setTimeout(() => {
        blinkCat(140)
        blinkTux(140)
      }, 380))
      setTuxFlapping(true)
      timers.current.push(setTimeout(() => setTuxFlapping(false), 380))
      setBubble({ id: Date.now(), text: DUO_LINES[Math.floor(Math.random() * DUO_LINES.length)], theme: 'duo' })
    }

    timers.current.push(setTimeout(() => setBubble(null), 1400))
  }

  const bubbleStyles = {
    cat: 'border-zinc-900 bg-white text-zinc-900 shadow-[2px_2px_0_#18181b] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0_#27272a] right-0',
    tux: 'border-zinc-900 bg-white text-zinc-900 shadow-[2px_2px_0_#18181b] dark:bg-zinc-100 right-0',
    duo: 'border-pink-600 bg-white text-pink-700 shadow-[2px_2px_0_#db2777] dark:bg-pink-50 left-1/2 -translate-x-1/2',
  }

  const label = petMode === 'cat' ? 'Pet the cat' : petMode === 'tux' ? 'Pet Tux penguin' : 'Pet the besties'

  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex items-center cursor-pointer select-none"
      aria-label={label}
      title={label}
    >
      <AnimatePresence>
        {bubble && (
          <motion.span
            key={bubble.id}
            initial={{ opacity: 0, y: 4, scale: 0.8 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -14 }}
            className={`absolute -top-7 z-20 whitespace-nowrap border-2 px-1.5 py-0.5 font-pixel text-[10px] ${
              bubbleStyles[bubble.theme] || bubbleStyles.cat
            }`}
          >
            {bubble.text}
          </motion.span>
        )}
      </AnimatePresence>

      {petMode === 'cat' && (
        <motion.div
          key={`cat-${hop}`}
          animate={hop ? { y: [0, -8, 0, -3, 0], rotate: [0, -6, 4, 0] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ rotate: -4 }}
          className="drop-shadow-[0_3px_0_rgba(0,0,0,0.35)] dark:drop-shadow-[0_3px_0_rgba(255,255,255,0.2)]"
        >
          <PixelCat blinking={catBlinking} />
        </motion.div>
      )}

      {petMode === 'tux' && (
        <motion.div
          key={`tux-${hop}`}
          animate={hop ? { y: [0, -8, 0, -3, 0], rotate: [0, -8, 8, -3, 0], scale: [1, 1.08, 0.96, 1] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ rotate: -4 }}
          className="drop-shadow-[0_3px_0_rgba(24,24,27,0.3)]"
        >
          <PixelTux blinking={tuxBlinking} flapping={tuxFlapping} width={44} height={38.5} />
        </motion.div>
      )}

      {petMode === 'duo' && (
        <div className="flex items-end gap-1">
          <motion.div
            key={`duo-cat-${hop}`}
            animate={hop ? { y: [0, -7, 0, -3, 0], rotate: [0, -6, 4, 0] } : {}}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            whileHover={{ rotate: -4 }}
            className="drop-shadow-[0_3px_0_rgba(0,0,0,0.35)] dark:drop-shadow-[0_3px_0_rgba(255,255,255,0.2)]"
          >
            <PixelCat blinking={catBlinking} width={34} height={25.5} />
          </motion.div>
          <motion.div
            key={`duo-tux-${hop}`}
            animate={hop ? { y: [0, -7, 0, -3, 0], rotate: [0, 6, -4, 0], scale: [1, 1.06, 0.96, 1] } : {}}
            transition={{ duration: 0.48, ease: 'easeOut', delay: 0.04 }}
            whileHover={{ rotate: 4 }}
            className="drop-shadow-[0_3px_0_rgba(24,24,27,0.3)]"
          >
            <PixelTux blinking={tuxBlinking} flapping={tuxFlapping} width={32} height={28} />
          </motion.div>
        </div>
      )}
    </button>
  )
}

// Backward-compatible alias
export const Cat = TopBarPet

export default function TopBar({ name = 'Kishlay', panel = 'today', petMode = 'cat', setPetMode, onOpenWelcome }) {
  const [showWisprModal, setShowWisprModal] = useState(false)
  const [petMenuOpen, setPetMenuOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(timer)
  }, [])

  const titles = {
    today: 'Today’s Plate',
    calendar: 'Studio Calendar',
    projects: 'Projects Hub',
    dump: 'Brain Dump',
    wrap: 'Evening Wrap-Up',
  }

  return (
    <>
      <div className={`relative ${petMenuOpen ? 'z-50' : 'z-20'} flex items-center justify-between gap-4 py-1`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex size-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
          {onOpenWelcome ? (
            <button
              type="button"
              onClick={onOpenWelcome}
              title="Change name or replay welcome experience"
              className="group inline-flex items-center gap-1 font-semibold tracking-tight text-zinc-900 transition hover:text-pink-600 dark:text-zinc-100 dark:hover:text-pink-400 cursor-pointer"
            >
              <span>{name}</span>
              <Sparkles className="size-2.5 text-pink-500 opacity-60 transition group-hover:opacity-100" />
            </button>
          ) : (
            <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{name}</span>
          )}
          <span className="text-zinc-400">/</span>
          <span className="rounded-md bg-black/[0.04] px-2 py-0.5 font-medium text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
            {titles[panel] || 'Planner'}
          </span>
          <PoweredByBadge onClick={() => setShowWisprModal(true)} />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden rounded-full border border-black/[0.06] bg-white/60 px-3 py-1 text-[11px] font-medium text-zinc-600 backdrop-blur-md sm:inline-flex sm:items-center sm:gap-1.5 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300">
            <span>{format(now, 'EEEE, MMM d')}</span>
            <span className="opacity-35">·</span>
            <span className="font-mono text-[10.5px] text-zinc-700 dark:text-zinc-200">{format(now, 'h:mm a')}</span>
          </span>
          <PetToggle petMode={petMode} setPetMode={setPetMode} onOpenChange={setPetMenuOpen} />
          <TopBarPet petMode={petMode} />
        </div>
      </div>

      <WisprFlowModal open={showWisprModal} onClose={() => setShowWisprModal(false)} />
    </>
  )
}
