import { AnimatePresence, motion } from 'framer-motion'
import ProjectCard from '../components/ProjectCard'
import { EmptyHint, projectHandlers } from './TodayPanel'
import { PANEL, LABEL } from '../lib/theme'
import { AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react'

const PRIORITY = { 'at-risk': 0, blocked: 1, 'on-track': 2, done: 3 }

export default function ProjectsPanel({ state, ops, highlight }) {
  const active = state.projects
    .filter((p) => p.status !== 'done')
    .sort(
      (a, b) =>
        (PRIORITY[a.status] ?? 9) - (PRIORITY[b.status] ?? 9) ||
        (a.deadline || '9999').localeCompare(b.deadline || '9999'),
    )
  const done = state.projects.filter((p) => p.status === 'done')
  const atRisk = active.filter((p) => p.status === 'at-risk')
  const blocked = active.filter((p) => p.status === 'blocked')
  const onTrack = active.filter((p) => p.status === 'on-track')

  const handlers = projectHandlers(ops)

  return (
    <div className="space-y-5">
      {/* Top Bento Stats Deck */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`${PANEL} flex items-center gap-3 p-3.5`}>
          <div className="grid size-9 place-items-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <PlayCircle size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{active.length}</div>
            <div className="text-[11px] text-zinc-500">Active Projects</div>
          </div>
        </div>

        <div className={`${PANEL} flex items-center gap-3 p-3.5`}>
          <div className="grid size-9 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{atRisk.length}</div>
            <div className="text-[11px] text-zinc-500">At Risk</div>
          </div>
        </div>

        <div className={`${PANEL} flex items-center gap-3 p-3.5`}>
          <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{onTrack.length}</div>
            <div className="text-[11px] text-zinc-500">On Track</div>
          </div>
        </div>

        <div className={`${PANEL} flex items-center gap-3 p-3.5`}>
          <div className="grid size-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{done.length}</div>
            <div className="text-[11px] text-zinc-500">Shipped</div>
          </div>
        </div>
      </div>

      {/* Main Bento Projects Grid */}
      <section className={`${PANEL} p-5`}>
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-zinc-900 dark:text-zinc-50">Projects Hub</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Milestones, deadlines & linked task deliverables</p>
          </div>
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {active.length} active{done.length ? ` · ${done.length} shipped` : ''}
          </span>
        </header>

        {state.projects.length === 0 ? (
          <EmptyHint>No projects tracked yet. Try: “New project Hackathon pitch due Friday”</EmptyHint>
        ) : (
          <div className="space-y-6">
            {/* Active Projects 2/3-Column Bento Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {active.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    todos={state.todos}
                    highlight={highlight}
                    {...handlers}
                    onDelete={ops.deleteItem}
                    expanded
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Shipped Projects */}
            {done.length > 0 && (
              <motion.div layout className="border-t border-black/5 pt-5 dark:border-white/10">
                <div className={`${LABEL} mb-3`}>Shipped Archive</div>
                <div className="grid grid-cols-1 gap-4 opacity-70 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence initial={false}>
                    {done.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        todos={state.todos}
                        highlight={highlight}
                        {...handlers}
                        onDelete={ops.deleteItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
