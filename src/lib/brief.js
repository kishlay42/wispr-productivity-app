import { todayKey, tomorrowKey, toMin, fromMin, nowMin, fmtTime, daysLeft, isTime } from './dates.js'

export const list = (items) => {
  if (!items) return ''
  const arr = (Array.isArray(items) ? items : [items])
    .map((x) => (x == null ? '' : String(x).trim()))
    .filter(Boolean)
  if (arr.length === 0) return ''
  if (arr.length === 1) return arr[0]
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`
  return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`
}

export const plural = (n, w, p) => {
  const count = Math.abs(Number(n) || 0)
  if (count === 1) return `${n} ${w}`
  return `${n} ${p || `${w}s`}`
}

export const at = (e) => {
  if (!e) return ''
  const title = e.title || 'Untitled event'
  const time = e.start && isTime(e.start) ? fmtTime(e.start) : ''
  return time ? `${title} at ${time}` : title
}

export function parseEventSpan(e) {
  if (!e || typeof e !== 'object') return null
  const s = toMin(e.start)
  if (s == null || isNaN(s)) return null
  let en = toMin(e.end)
  if (en == null || isNaN(en) || en <= s) {
    en = Math.min(s + 30, 23 * 60 + 59)
  }
  return { start: s, end: en }
}

export function formatCountdown(minutes) {
  if (minutes == null || isNaN(minutes)) return ''
  const mTotal = Math.round(minutes)
  if (mTotal <= 0) return 'starting right now'
  if (mTotal === 1) return 'in 1 minute'
  if (mTotal < 60) return `in ${mTotal} minutes`
  if (mTotal === 60) return 'in 1 hour'
  const h = Math.floor(mTotal / 60)
  const remMin = mTotal % 60
  if (remMin === 0) return `in ${plural(h, 'hour')}`
  return `in ${plural(h, 'hour')} and ${plural(remMin, 'minute')}`
}

export function findFocusBlocks(events, { minMinutes = 90 } = {}) {
  const spans = (Array.isArray(events) ? events : [])
    .filter((e) => !e.done)
    .map(parseEventSpan)
    .filter(Boolean)
    .sort((a, b) => a.start - b.start)

  if (spans.length < 2) return []

  const merged = [spans[0]]
  for (let i = 1; i < spans.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = spans[i]
    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end)
    } else {
      merged.push({ ...curr })
    }
  }

  const blocks = []
  for (let i = 0; i < merged.length - 1; i++) {
    const endPrev = merged[i].end
    const startNext = merged[i + 1].start
    const gap = startNext - endPrev
    if (gap >= minMinutes) {
      blocks.push({
        start: endPrev,
        end: startNext,
        durationMinutes: gap,
      })
    }
  }
  return blocks
}

export function freeLine(events, options = {}) {
  const taskCount = typeof options === 'number' ? options : (options?.taskCount ?? 0)
  const timed = (Array.isArray(events) ? events : [])
    .filter((e) => !e.done)
    .map(parseEventSpan)
    .filter(Boolean)

  if (!timed.length) {
    return taskCount > 0
      ? 'Your calendar is wide open for focus work.'
      : "You're free all day."
  }

  const lastEnd = Math.max(...timed.map((sp) => sp.end))
  const now = nowMin()

  if (lastEnd <= now) {
    return taskCount > 0
      ? "You're done with meetings for today, leaving open time for your to-dos."
      : "You're free for the rest of the day."
  }

  const freeTime = fmtTime(fromMin(lastEnd))
  if (!freeTime) {
    return taskCount > 0
      ? 'Your calendar is clear for focus work.'
      : "You're free all day."
  }

  return taskCount > 0
    ? `You're free of meetings after ${freeTime}.`
    : `You're free after ${freeTime}.`
}

export function projectLines(state) {
  const projects = Array.isArray(state?.projects) ? state.projects : []
  const lines = []

  for (const p of projects) {
    if (!p || p.status === 'done') continue
    const name = p.name || 'Untitled project'
    const left = daysLeft(p.deadline)
    const isOverdue = left != null && left < 0
    const absDays = isOverdue ? Math.abs(left) : null

    if (p.status === 'at-risk') {
      if (isOverdue) {
        lines.push(`${name} is at risk and overdue by ${plural(absDays, 'day')}.`)
      } else if (left === 0) {
        lines.push(`${name} is at risk and due today.`)
      } else if (left === 1) {
        lines.push(`${name} is at risk and due tomorrow.`)
      } else if (left != null && left > 1) {
        lines.push(`${name} is at risk, due in ${plural(left, 'day')}.`)
      } else {
        lines.push(`${name} is currently flagged at risk.`)
      }
    } else if (p.status === 'blocked') {
      const note = p.note ? `: ${p.note.replace(/\s*·\s*/g, ', ')}` : ''
      lines.push(`${name} is blocked${note}.`)
    } else if (isOverdue) {
      lines.push(`${name} is overdue by ${plural(absDays, 'day')}.`)
    } else if (left === 0) {
      lines.push(`${name} is due today.`)
    } else if (left === 1) {
      lines.push(`${name} is due tomorrow.`)
    }
  }

  return lines
}

export function getBriefStats(state) {
  const today = todayKey()
  const now = nowMin()
  const events = Array.isArray(state?.events) ? state.events : []
  const todos = Array.isArray(state?.todos) ? state.todos : []
  const projects = Array.isArray(state?.projects) ? state.projects : []

  const byTime = (a, b) => (toMin(a?.start) ?? 9999) - (toMin(b?.start) ?? 9999)
  const eventsToday = events.filter((e) => e && e.date === today && !e.done).sort(byTime)
  const doneEventsToday = events.filter((e) => e && e.date === today && e.done)

  const openToday = todos.filter((t) => t && !t.done && (t.date === today || (t.date && t.date < today)))
  const tasks = openToday.filter((t) => t.kind !== 'followup')
  const followToday = openToday.filter((t) => t.kind === 'followup')
  const carriedTodos = openToday.filter((t) => t.carriedOver || (t.date && t.date < today))

  const doneTodosToday = todos.filter(
    (t) => t && t.done && (t.date === today || (t.doneAt && new Date(t.doneAt).toDateString() === new Date().toDateString()))
  )

  const activeProjects = projects.filter((p) => p && p.status !== 'done')
  const riskyProjects = activeProjects.filter((p) => p.status === 'at-risk' || p.status === 'blocked')
  const overdueProjects = activeProjects.filter((p) => {
    const d = daysLeft(p.deadline)
    return d != null && d < 0
  })

  const timed = eventsToday
    .map((e) => ({ event: e, span: parseEventSpan(e) }))
    .filter((x) => x.span != null)
    .sort((a, b) => a.span.start - b.span.start)

  const upcomingTimed = timed.filter((x) => x.span.start > now)
  const currentTimed = timed.find((x) => x.span.start <= now && x.span.end > now)
  const nextItem = upcomingTimed[0] || null

  const lastEnd = timed.length ? Math.max(...timed.map((x) => x.span.end)) : null
  const freeText = !timed.length
    ? (tasks.length > 0 ? 'Calendar clear' : 'Free all day')
    : lastEnd <= now
    ? 'Free now'
    : `Free after ${fmtTime(fromMin(lastEnd))}`

  return {
    eventCount: eventsToday.length,
    upcomingEventCount: upcomingTimed.length + (currentTimed ? 1 : 0),
    todoCount: openToday.length,
    taskCount: tasks.length,
    followupCount: followToday.length,
    doneCount: doneTodosToday.length + doneEventsToday.length,
    doneTodoCount: doneTodosToday.length,
    doneEventCount: doneEventsToday.length,
    riskyCount: riskyProjects.length,
    carriedCount: carriedTodos.length,
    overdueCount: overdueProjects.length,
    overdueProjectCount: overdueProjects.length,
    free: freeText,
    nextEvent: nextItem
      ? {
          ...nextItem.event,
          diffMinutes: nextItem.span.start - now,
          startMin: nextItem.span.start,
          endMin: nextItem.span.end,
        }
      : null,
    currentEvent: currentTimed
      ? {
          ...currentTimed.event,
          startMin: currentTimed.span.start,
          endMin: currentTimed.span.end,
        }
      : null,
    events: eventsToday,
    todos: openToday,
    risky: riskyProjects,
  }
}

export const briefStats = getBriefStats
export const dayStats = getBriefStats

// mode: 'now' (rest of today) | 'morning' | 'evening'
export function buildBrief(state, mode = 'now', name = 'Kishlay') {
  const today = todayKey()
  const tomorrow = tomorrowKey()
  const stats = getBriefStats(state)
  const events = Array.isArray(state?.events) ? state.events : []
  const todos = Array.isArray(state?.todos) ? state.todos : []

  const byTime = (a, b) => (toMin(a?.start) ?? 9999) - (toMin(b?.start) ?? 9999)
  const eventsToday = stats.events
  const openToday = stats.todos
  const tasks = openToday.filter((t) => t.kind !== 'followup')
  const followToday = openToday.filter((t) => t.kind === 'followup')
  const doneTodosToday = todos.filter(
    (t) => t && t.done && (t.date === today || (t.doneAt && new Date(t.doneAt).toDateString() === new Date().toDateString()))
  )
  const doneEventsToday = events.filter((e) => e && e.date === today && e.done)

  const s = []

  if (mode === 'morning') {
    s.push(`Good morning, ${name}. Here's your day.`)

    if (eventsToday.length === 0) {
      s.push('Your calendar is clear today.')
    } else if (eventsToday.length === 1) {
      s.push(`You have 1 event today: ${at(eventsToday[0])}.`)
    } else {
      s.push(
        `You have ${plural(eventsToday.length, 'event')} today: ${list(eventsToday.slice(0, 4).map(at))}${
          eventsToday.length > 4 ? `, plus ${eventsToday.length - 4} more` : ''
        }.`
      )
    }

    if (tasks.length > 0) {
      const carried = tasks.filter((t) => t.carriedOver || (t.date && t.date < today)).length
      const carriedNote = carried ? `, including ${plural(carried, 'item')} carried over` : ''
      s.push(`${plural(tasks.length, 'to-do')} on your plate: ${list(tasks.slice(0, 5).map((t) => t.title))}${carriedNote}.`)
    } else if (openToday.length === 0 && eventsToday.length > 0) {
      s.push('No to-dos scheduled yet for today.')
    }

    if (followToday.length > 0) {
      const followList = followToday
        .map((t) => (t.title || '').replace(/^follow[\s-]*up\s*(with|on)?\s*/i, '').trim() || t.title)
      s.push(`Follow up on ${list(followList)} today.`)
    }

    const focusBlocks = findFocusBlocks(eventsToday)
    if (focusBlocks.length > 0) {
      const b = focusBlocks[0]
      const hrs = b.durationMinutes / 60
      const hrsLabel = hrs % 1 === 0 ? `${hrs}` : `${hrs.toFixed(1).replace(/\.0$/, '')}`
      s.push(`You have a ${hrsLabel}-hour focus block between ${fmtTime(fromMin(b.start))} and ${fmtTime(fromMin(b.end))}.`)
    }

    const pLines = projectLines(state).slice(0, 3)
    if (pLines.length) {
      s.push(...pLines)
    }

    s.push(freeLine(eventsToday, { taskCount: tasks.length, mode: 'morning' }))
    s.push("Let's yap it done.")

    return {
      title: 'Morning brief',
      sentences: s.filter(Boolean),
      stats,
      mode: 'morning',
    }
  }

  if (mode === 'evening') {
    s.push(`Good evening, ${name}. Here's your wrap-up.`)

    const done = [...doneTodosToday, ...doneEventsToday]
    if (done.length > 0) {
      s.push(`You finished ${plural(done.length, 'thing')} today: ${list(done.slice(0, 5).map((t) => t.title))}. Nice work!`)
    } else {
      s.push("Nothing ticked off today, and that's okay. Tomorrow is a fresh start.")
    }

    if (openToday.length > 0) {
      s.push(
        `You have ${plural(openToday.length, 'item')} still open: ${list(openToday.slice(0, 4).map((t) => t.title))}. Tap Close the day to carry them to tomorrow.`
      )
    } else {
      s.push('Your plate is completely clear.')
    }

    const tmrEvents = events.filter((e) => e && e.date === tomorrow && !e.done).sort(byTime)
    const tmrFollow = todos.filter((t) => t && t.date === tomorrow && !t.done && t.kind === 'followup')

    if (tmrEvents.length > 0) {
      s.push(
        `Tomorrow starts with ${at(tmrEvents[0])}${tmrEvents.length > 1 ? `, followed by ${plural(tmrEvents.length - 1, 'more event')}` : ''}.`
      )
    } else {
      s.push("Tomorrow's calendar is wide open.")
    }

    if (tmrFollow.length > 0) {
      const followList = tmrFollow
        .map((t) => (t.title || '').replace(/^follow[\s-]*up\s*(with|on)?\s*/i, '').trim() || t.title)
      s.push(`Follow-ups tomorrow: ${list(followList)}.`)
    }

    const pLines = projectLines(state).slice(0, 2)
    if (pLines.length) {
      s.push(...pLines)
    }

    s.push('Rest well.')

    return {
      title: 'Evening wrap',
      sentences: s.filter(Boolean),
      stats,
      mode: 'evening',
    }
  }

  // mode: 'now' (rest of today)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  s.push(`${greeting}, ${name}. Here's the rest of your day.`)

  // 1. Accomplishments so far vs remaining
  if (doneTodosToday.length > 0 && tasks.length > 0) {
    s.push(`You've knocked out ${plural(doneTodosToday.length, 'task')} already, ${tasks.length} to go.`)
  } else if (doneTodosToday.length > 0 && tasks.length === 0) {
    s.push(`You've knocked out all ${doneTodosToday.length} tasks today. Awesome work!`)
  }

  // 2. Upcoming meetings / countdown
  const { currentEvent, nextEvent } = stats
  const timed = eventsToday
    .map((e) => ({ event: e, span: parseEventSpan(e) }))
    .filter((x) => x.span != null)
    .sort((a, b) => a.span.start - b.span.start)
  const upcomingTimed = timed.filter((x) => x.span.start > nowMin())

  if (currentEvent) {
    const currentEnd = fmtTime(fromMin(currentEvent.endMin))
    s.push(`${currentEvent.title} is underway right now until ${currentEnd}.`)
  }

  if (nextEvent) {
    const countdown = formatCountdown(nextEvent.diffMinutes)
    if (nextEvent.diffMinutes <= 0) {
      s.push(`Your next event is ${nextEvent.title}, starting right now.`)
    } else {
      s.push(`Your next event is ${nextEvent.title} ${countdown}.`)
    }

    const remainingAfterNext = upcomingTimed.filter((x) => x.event.id !== nextEvent.id)
    if (remainingAfterNext.length > 0) {
      s.push(`Still ahead after that: ${list(remainingAfterNext.slice(0, 3).map((x) => at(x.event)))}.`)
    } else if (!currentEvent) {
      s.push("That's your last event scheduled for today.")
    }
  } else if (!currentEvent) {
    if (eventsToday.length > 0) {
      s.push("You're all done with meetings for today.")
    } else {
      s.push('Nothing on the calendar.')
    }
  }

  // 3. Remaining tasks
  if (tasks.length > 0) {
    const carried = tasks.filter((t) => t.carriedOver || (t.date && t.date < today)).length
    const carriedNote = carried ? `, including ${plural(carried, 'item')} carried over` : ''
    if (doneTodosToday.length > 0) {
      s.push(`Still on your to-do list: ${list(tasks.slice(0, 4).map((t) => t.title))}${carriedNote}.`)
    } else {
      s.push(`${plural(tasks.length, 'pending task')}: ${list(tasks.slice(0, 4).map((t) => t.title))}${carriedNote}.`)
    }
  } else if (doneTodosToday.length === 0) {
    s.push('No pending tasks on your plate.')
  }

  // 4. Follow-ups
  if (followToday.length > 0) {
    const followList = followToday
      .map((t) => (t.title || '').replace(/^follow[\s-]*up\s*(with|on)?\s*/i, '').trim() || t.title)
    s.push(`Don't forget to follow up on ${list(followList)} today.`)
  }

  // 5. At-risk / project warnings
  const pLines = projectLines(state).slice(0, 2)
  if (pLines.length) {
    s.push(...pLines)
  }

  // 6. Free line
  s.push(freeLine(eventsToday, { taskCount: tasks.length, mode: 'now' }))

  // 7. Encouragement
  if (tasks.length > 0 || (nextEvent && nextEvent.diffMinutes < 60)) {
    s.push('Keep the momentum going.')
  } else {
    s.push("You're in great shape for the rest of the day.")
  }

  return {
    title: 'Rest of today',
    sentences: s.filter(Boolean),
    stats,
    mode: 'now',
  }
}
