import { useEffect, useRef, useState } from 'react'
import nekoSprites from '../lib/pets/neko-sprites.json'
import tuxSprites from '../lib/pets/tux-sprites.json'
import { ChevronDown, Check } from 'lucide-react'

// Neko98 Pet States
const PetState = {
  STOP: 0,
  WASH: 1,
  SCRATCH: 2,
  YAWN: 3,
  SLEEP: 4,
  AWAKE: 5,
  U_MOVE: 6,
  D_MOVE: 7,
  L_MOVE: 8,
  R_MOVE: 9,
  UL_MOVE: 10,
  UR_MOVE: 11,
  DL_MOVE: 12,
  DR_MOVE: 13,
  U_CLAW: 14,
  D_CLAW: 15,
  L_CLAW: 16,
  R_CLAW: 17,
}

// Exact Neko98 32-sprite animation table
const ANIMATION_TABLE = [
  [28, 28], // STOP
  [25, 28], // WASH
  [26, 27], // SCRATCH
  [29, 29], // YAWN
  [30, 31], // SLEEP
  [0, 0],   // AWAKE
  [1, 2],   // U_MOVE (Up)
  [9, 10],  // D_MOVE (Down)
  [13, 14], // L_MOVE (Left)
  [5, 6],   // R_MOVE (Right)
  [15, 16], // UL_MOVE (Up-Left)
  [3, 4],   // UR_MOVE (Up-Right)
  [11, 12], // DL_MOVE (Down-Left)
  [7, 8],   // DR_MOVE (Down-Right)
  [17, 18], // U_CLAW
  [23, 24], // D_CLAW
  [21, 22], // L_CLAW
  [19, 20], // R_CLAW
]

function calcDirection(dx, dy) {
  if (dx === 0 && dy === 0) return PetState.STOP
  const largeX = dx
  const largeY = -dy // Invert because screen Y increases downward
  const length = Math.sqrt(largeX * largeX + largeY * largeY)
  if (length === 0) return PetState.STOP

  const sinTheta = largeY / length
  const sinPiPer8 = 0.3826834323651
  const sinPiPer8Times3 = 0.9238795325113

  if (dx > 0) {
    if (sinTheta > sinPiPer8Times3) return PetState.U_MOVE
    if (sinTheta > sinPiPer8) return PetState.UR_MOVE
    if (sinTheta > -sinPiPer8) return PetState.R_MOVE
    if (sinTheta > -sinPiPer8Times3) return PetState.DR_MOVE
    return PetState.D_MOVE
  } else {
    if (sinTheta > sinPiPer8Times3) return PetState.U_MOVE
    if (sinTheta > sinPiPer8) return PetState.UL_MOVE
    if (sinTheta > -sinPiPer8) return PetState.L_MOVE
    if (sinTheta > -sinPiPer8Times3) return PetState.DL_MOVE
    return PetState.D_MOVE
  }
}

function PetRunner({ mascotType = 'cat', initialOffset = 0 }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  const isTux = mascotType === 'tux'
  const sprites = isTux ? tuxSprites : nekoSprites
  const size = isTux ? 46 : 32
  const speed = isTux ? 20 : 18

  useEffect(() => {
    let boundsWidth = window.innerWidth - size
    let boundsHeight = window.innerHeight - size

    let logicX = Math.max(20, Math.min(boundsWidth, window.innerWidth / 2 + initialOffset))
    let logicY = Math.max(20, Math.min(boundsHeight, window.innerHeight / 2))
    let prevLogicX = logicX
    let prevLogicY = logicY

    let mouseX = logicX
    let mouseY = logicY

    let state = PetState.STOP
    let stateCount = 0
    let tickCount = 0
    let awakeDelay = 0
    let isAwake = false

    let lastTime = performance.now()
    let tickAccumulator = 0
    const TICK_INTERVAL = 125 // ~8fps Neko tick rate
    let animationId

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const onResize = () => {
      boundsWidth = window.innerWidth - size
      boundsHeight = window.innerHeight - size
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('resize', onResize)

    const loop = (currentTime) => {
      const dt = currentTime - lastTime
      lastTime = currentTime
      tickAccumulator += dt / TICK_INTERVAL

      while (tickAccumulator >= 1.0) {
        tickAccumulator -= 1.0
        tickCount++
        stateCount++

        prevLogicX = logicX
        prevLogicY = logicY

        const petCenterX = logicX + size / 2
        const petCenterY = logicY + size / 2
        const dxToMouse = mouseX - petCenterX
        const dyToMouse = mouseY - petCenterY
        const distToMouse = Math.hypot(dxToMouse, dyToMouse)

        let targetDx = 0
        let targetDy = 0
        let shouldMove = false

        if (isTux) {
          // TUX PENGUIN FLEES AWAY FROM MOUSE POINTER!
          const FLEE_RADIUS = 190
          if (distToMouse < FLEE_RADIUS) {
            shouldMove = true
            // Opposite direction (away from mouse)
            const fleeAngle = Math.atan2(petCenterY - mouseY, petCenterX - mouseX)
            targetDx = Math.cos(fleeAngle) * speed
            targetDy = Math.sin(fleeAngle) * speed
          } else {
            shouldMove = false
          }
        } else {
          // NEKO CAT CHASES MOUSE!
          // Facing forward towards mouse, stopping when close
          const STOP_RADIUS = 36
          if (distToMouse > STOP_RADIUS) {
            shouldMove = true
            const angle = Math.atan2(dyToMouse, dxToMouse)
            const step = Math.min(distToMouse, speed)
            targetDx = Math.cos(angle) * step
            targetDy = Math.sin(angle) * step
          } else {
            shouldMove = false
          }
        }

        if (shouldMove) {
          if (!isAwake) {
            state = PetState.AWAKE
            isAwake = true
            awakeDelay = 2
          } else if (awakeDelay > 0) {
            awakeDelay--
            state = PetState.AWAKE
          } else {
            // Move pet
            logicX += targetDx
            logicY += targetDy

            // Keep within window bounds
            logicX = Math.max(10, Math.min(boundsWidth - 10, logicX))
            logicY = Math.max(10, Math.min(boundsHeight - 10, logicY))

            // Direction calculation: faces the exact movement direction!
            state = calcDirection(targetDx, targetDy)
          }
        } else {
          // Stopped: idle progression (Wash -> Scratch -> Yawn -> Sleep)
          if (isAwake && state >= PetState.U_MOVE) {
            isAwake = false
            state = PetState.STOP
            stateCount = 0
          }

          if (state === PetState.STOP) {
            if (stateCount > 4) {
              state = PetState.WASH
              stateCount = 0
            }
          } else if (state === PetState.WASH) {
            if (stateCount > 8) {
              state = PetState.SCRATCH
              stateCount = 0
            }
          } else if (state === PetState.SCRATCH) {
            if (stateCount > 6) {
              state = PetState.YAWN
              stateCount = 0
            }
          } else if (state === PetState.YAWN) {
            if (stateCount > 4) {
              state = PetState.SLEEP
              stateCount = 0
            }
          }
        }

        // Frame index from ANIMATION_TABLE
        let frameIdx = 0
        if (state === PetState.SLEEP) {
          frameIdx = ANIMATION_TABLE[PetState.SLEEP][(tickCount >> 2) & 1]
        } else {
          const animRow = ANIMATION_TABLE[state] || ANIMATION_TABLE[PetState.STOP]
          frameIdx = animRow[tickCount & 1]
        }

        if (imgRef.current && sprites[frameIdx]) {
          imgRef.current.src = sprites[frameIdx]
        }
      }

      // Smooth display interpolation
      const t = tickAccumulator
      const renderX = prevLogicX + (logicX - prevLogicX) * t
      const renderY = prevLogicY + (logicY - prevLogicY) * t

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${Math.round(renderX)}px, ${Math.round(renderY)}px, 0)`
      }

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animationId)
    }
  }, [mascotType, initialOffset, size, speed, sprites, isTux])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed left-0 top-0 z-50 select-none will-change-transform"
      style={{
        transform: 'translate3d(100px, 100px, 0)',
      }}
      aria-hidden="true"
    >
      <img
        ref={imgRef}
        src={sprites[28]}
        alt={isTux ? 'Tux Penguin' : 'Neko Cat'}
        width={size}
        height={size}
        className="block select-none"
        style={{
          imageRendering: 'pixelated',
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    </div>
  )
}

export function PetToggle({ petMode, setPetMode, onOpenChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    onOpenChange?.(open)
    return () => {
      if (open) onOpenChange?.(false)
    }
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e) => !ref.current?.contains(e.target) && setOpen(false)
    window.addEventListener('pointerdown', onClickOutside)
    return () => window.removeEventListener('pointerdown', onClickOutside)
  }, [open])

  // Only Neko Cat, Tux Penguin, Both, or None
  const options = [
    { id: 'cat', label: 'Neko Cat', icon: '🐱', hint: 'Chases cursor forward' },
    { id: 'tux', label: 'Tux Penguin', icon: '🐧', hint: 'Flees away from cursor' },
    { id: 'duo', label: 'Cat & Penguin', icon: '🌸', hint: 'Cat chases, Tux flees' },
    { id: 'none', label: 'None (Off)', icon: '💤', hint: 'Hide screen pets' },
  ]

  // Fallback to cat if invalid mode was previously selected
  const activeMode = ['cat', 'tux', 'duo', 'none'].includes(petMode) ? petMode : 'cat'
  const current = options.find((o) => o.id === activeMode) || options[0]

  return (
    <div ref={ref} className="relative z-40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Screen Pet Settings (Neko Cat & Tux Penguin)"
        aria-label="Screen Pet Settings"
        className="group flex items-center gap-1.5 rounded-xl border border-pink-500/20 bg-white/70 px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-md transition hover:border-pink-400/50 hover:bg-white hover:text-zinc-950 dark:border-pink-500/20 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-sky-500/40 dark:hover:bg-zinc-800/90 dark:hover:text-white"
      >
        <span className="text-sm">{current.icon}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          size={12}
          className={`text-zinc-400 transition-transform duration-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[70] w-56 rounded-2xl border border-pink-500/20 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-sky-500/20 dark:bg-zinc-900/95">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-pink-500 dark:text-sky-400">
            Screen Pets
          </div>
          {options.map((opt) => {
            const active = activeMode === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setPetMode(opt.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                  active
                    ? 'bg-pink-500/10 font-medium text-pink-600 dark:bg-sky-500/10 dark:text-sky-300'
                    : 'text-zinc-700 hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{opt.icon}</span>
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{opt.hint}</div>
                  </div>
                </div>
                {active && <Check size={14} className="text-pink-500 dark:text-sky-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ScreenPets({ petMode = 'cat' }) {
  if (petMode === 'none') return null

  const activeMode = ['cat', 'tux', 'duo', 'none'].includes(petMode) ? petMode : 'cat'

  return (
    <>
      {(activeMode === 'cat' || activeMode === 'duo') && (
        <PetRunner mascotType="cat" initialOffset={-60} />
      )}
      {(activeMode === 'tux' || activeMode === 'duo') && (
        <PetRunner mascotType="tux" initialOffset={60} />
      )}
    </>
  )
}
