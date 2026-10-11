import test from 'node:test'
import assert from 'node:assert/strict'
import {
  list,
  plural,
  at,
  parseEventSpan,
  formatCountdown,
  findFocusBlocks,
  freeLine,
  projectLines,
  getBriefStats,
  buildBrief,
} from '../src/lib/brief.js'
import { todayKey, shiftKey } from '../src/lib/dates.js'

test('list() formatting', async (t) => {
  await t.test('handles empty / falsy inputs', () => {
    assert.equal(list([]), '')
    assert.equal(list(null), '')
    assert.equal(list(undefined), '')
    assert.equal(list(['', null, '  ', undefined]), '')
  })

  await t.test('handles single item', () => {
    assert.equal(list(['Design poster']), 'Design poster')
    assert.equal(list(['  Design poster  ']), 'Design poster')
  })

  await t.test('handles two items', () => {
    assert.equal(list(['Design poster', 'Call mom']), 'Design poster and Call mom')
  })

  await t.test('handles three or more items with Oxford comma for natural speech', () => {
    assert.equal(
      list(['Design poster', 'Call mom', 'Buy groceries']),
      'Design poster, Call mom, and Buy groceries'
    )
    assert.equal(
      list(['One', 'Two', 'Three', 'Four']),
      'One, Two, Three, and Four'
    )
  })
})

test('plural() formatting', () => {
  assert.equal(plural(1, 'event'), '1 event')
  assert.equal(plural(2, 'event'), '2 events')
  assert.equal(plural(0, 'event'), '0 events')
  assert.equal(plural(1, 'to-do'), '1 to-do')
  assert.equal(plural(3, 'to-do'), '3 to-dos')
  assert.equal(plural(2, 'thing', 'things'), '2 things')
})

test('at() event formatting', () => {
  assert.equal(at(null), '')
  assert.equal(at({ title: 'Standup', start: '10:00' }), 'Standup at 10 AM')
  assert.equal(at({ title: 'Gym', start: '19:30' }), 'Gym at 7:30 PM')
  assert.equal(at({ title: 'All day fest' }), 'All day fest')
  assert.equal(at({ title: 'Invalid time', start: 'invalid' }), 'Invalid time')
})

test('parseEventSpan() duration calculation', () => {
  assert.equal(parseEventSpan(null), null)
  assert.equal(parseEventSpan({}), null)
  assert.equal(parseEventSpan({ start: 'bad' }), null)

  // Default duration is 30 mins when end is null or missing
  const noEnd = parseEventSpan({ start: '10:00' })
  assert.deepEqual(noEnd, { start: 600, end: 630 })

  // Valid range
  const valid = parseEventSpan({ start: '13:00', end: '14:30' })
  assert.deepEqual(valid, { start: 780, end: 870 })

  // End before start defaults to +30 min
  const reversed = parseEventSpan({ start: '15:00', end: '12:00' })
  assert.deepEqual(reversed, { start: 900, end: 930 })
})

test('formatCountdown() phrasing', () => {
  assert.equal(formatCountdown(0), 'starting right now')
  assert.equal(formatCountdown(-5), 'starting right now')
  assert.equal(formatCountdown(1), 'in 1 minute')
  assert.equal(formatCountdown(25), 'in 25 minutes')
  assert.equal(formatCountdown(60), 'in 1 hour')
  assert.equal(formatCountdown(90), 'in 1 hour and 30 minutes')
  assert.equal(formatCountdown(120), 'in 2 hours')
  assert.equal(formatCountdown(135), 'in 2 hours and 15 minutes')
})

test('freeLine() calculations and edge cases', async (t) => {
  await t.test('handles empty events without tasks', () => {
    assert.equal(freeLine([]), "You're free all day.")
    assert.equal(freeLine([], 0), "You're free all day.")
  })

  await t.test('fixes "You\'re free all day" bug when tasks are on plate', () => {
    assert.equal(freeLine([], 4), 'Your calendar is wide open for focus work.')
    assert.equal(freeLine([], { taskCount: 3 }), 'Your calendar is wide open for focus work.')
  })

  await t.test('handles invalid / null time strings without NaN or crashing', () => {
    const invalidEvents = [
      { title: 'Bad event 1', start: 'not-a-time', end: null },
      { title: 'Bad event 2', start: null, end: 'also-not' },
    ]
    assert.equal(freeLine(invalidEvents, 0), "You're free all day.")
    assert.equal(freeLine(invalidEvents, 2), 'Your calendar is wide open for focus work.')
  })

  await t.test('handles future events with/without tasks', () => {
    // Event ending at 23:00 (11 PM) - safely in future for standard test
    const events = [{ title: 'Late event', start: '22:00', end: '23:00' }]
    assert.equal(freeLine(events, 0), "You're free after 11 PM.")
    assert.equal(freeLine(events, 2), "You're free of meetings after 11 PM.")
  })
})

test('projectLines() deadline and risk detection', async (t) => {
  const d0 = todayKey()
  const dYesterday = shiftKey(d0, -1)
  const dTwoDaysAgo = shiftKey(d0, -2)
  const dTomorrow = shiftKey(d0, 1)
  const dNextWeek = shiftKey(d0, 7)

  await t.test('handles overdue and due-today projects correctly without crashing', () => {
    const state = {
      projects: [
        { name: 'Overdue Project', status: 'on-track', deadline: dTwoDaysAgo },
        { name: 'Due Today Project', status: 'on-track', deadline: d0 },
        { name: 'Due Tomorrow Project', status: 'on-track', deadline: dTomorrow },
        { name: 'At Risk Overdue', status: 'at-risk', deadline: dYesterday },
        { name: 'At Risk Due Today', status: 'at-risk', deadline: d0 },
        { name: 'Blocked Project', status: 'blocked', note: 'Waiting on client · awaiting approval' },
        { name: 'Done Project', status: 'done', deadline: dTwoDaysAgo },
      ],
    }

    const lines = projectLines(state)
    assert.ok(lines.some((l) => l.includes('Overdue Project is overdue by 2 days.')))
    assert.ok(lines.some((l) => l.includes('Due Today Project is due today.')))
    assert.ok(lines.some((l) => l.includes('Due Tomorrow Project is due tomorrow.')))
    assert.ok(lines.some((l) => l.includes('At Risk Overdue is at risk and overdue by 1 day.')))
    assert.ok(lines.some((l) => l.includes('At Risk Due Today is at risk and due today.')))
    assert.ok(lines.some((l) => l.includes('Blocked Project is blocked: Waiting on client, awaiting approval.')))
    // Done project should NOT be in lines
    assert.ok(!lines.some((l) => l.includes('Done Project')))
  })

  await t.test('handles null / missing deadlines safely', () => {
    const state = {
      projects: [
        { name: 'No Deadline At Risk', status: 'at-risk', deadline: null },
        { name: 'Invalid Date', status: 'on-track', deadline: 'some-bad-date' },
      ],
    }
    const lines = projectLines(state)
    assert.ok(lines.some((l) => l.includes('No Deadline At Risk is currently flagged at risk.')))
    // Invalid date doesn't match upcoming or overdue, handled safely
  })
})

test('findFocusBlocks() detects gaps between events', () => {
  const events = [
    { title: 'Morning sync', start: '09:00', end: '09:30' },
    { title: 'Lunch', start: '12:00', end: '13:00' },
    { title: 'Review', start: '16:00', end: '17:00' },
  ]
  const blocks = findFocusBlocks(events, { minMinutes: 90 })
  assert.equal(blocks.length, 2)
  // First gap: 09:30 to 12:00 = 150 minutes (2.5h)
  assert.equal(blocks[0].durationMinutes, 150)
  assert.equal(blocks[0].start, 9 * 60 + 30)
  assert.equal(blocks[0].end, 12 * 60)
  // Second gap: 13:00 to 16:00 = 180 minutes (3h)
  assert.equal(blocks[1].durationMinutes, 180)
})

test('getBriefStats() summarizes state', () => {
  const d0 = todayKey()
  const state = {
    events: [
      { id: 'e1', title: 'Standup', date: d0, start: '10:00', end: '10:30', done: false },
      { id: 'e2', title: 'Planning', date: d0, start: '15:00', end: '16:00', done: true },
    ],
    todos: [
      { id: 't1', title: 'Task 1', date: d0, done: false, carriedOver: true },
      { id: 't2', title: 'Task 2', date: d0, done: false },
      { id: 't3', title: 'Done task', date: d0, done: true, doneAt: Date.now() },
      { id: 't4', title: 'Follow up with Riya', date: d0, done: false, kind: 'followup' },
    ],
    projects: [
      { name: 'Project A', status: 'at-risk', deadline: d0 },
      { name: 'Project B', status: 'blocked', note: 'Blocked on API' },
    ],
  }

  const stats = getBriefStats(state)
  assert.equal(stats.eventCount, 1) // 1 non-done event today
  assert.equal(stats.todoCount, 3) // 2 tasks + 1 followup open
  assert.equal(stats.taskCount, 2) // regular open tasks
  assert.equal(stats.followupCount, 1)
  assert.equal(stats.doneCount, 2) // 1 done event + 1 done todo
  assert.equal(stats.riskyCount, 2) // Project A + Project B
  assert.equal(stats.carriedCount, 1)
  assert.ok(stats.free)
})

test('buildBrief() generates natural spoken briefs across all modes', async (t) => {
  const d0 = todayKey()
  const d1 = shiftKey(d0, 1)
  const state = {
    events: [
      { id: 'e1', title: 'Standup', date: d0, start: '10:00', end: '10:30', done: false },
      { id: 'e2', title: 'Sync with Team', date: d0, start: '14:00', end: '15:00', done: false },
      { id: 'e3', title: 'Kickoff tomorrow', date: d1, start: '11:00', end: '12:00', done: false },
    ],
    todos: [
      { id: 't1', title: 'Reply to emails', date: d0, done: true, doneAt: Date.now() },
      { id: 't2', title: 'Design fest poster', date: d0, done: false },
      { id: 't3', title: 'Call mom', date: d0, done: false, carriedOver: true },
      { id: 't4', title: 'Follow up with Arjun', date: d0, done: false, kind: 'followup' },
    ],
    projects: [
      { name: 'College Fest', status: 'at-risk', deadline: d0 },
    ],
  }

  await t.test('mode: morning generates complete preview and focus block', () => {
    const brief = buildBrief(state, 'morning', 'Kishlay')
    assert.equal(brief.title, 'Morning brief')
    assert.equal(brief.mode, 'morning')
    assert.ok(brief.sentences.length >= 4)
    assert.ok(brief.sentences[0].includes('Good morning, Kishlay.'))
    assert.ok(brief.sentences.some((s) => s.includes('Standup at 10 AM')))
    assert.ok(brief.sentences.some((s) => s.includes('carried over')))
    assert.ok(brief.sentences.some((s) => s.includes('Follow up on Arjun today.')))
    assert.ok(brief.sentences.some((s) => s.includes('College Fest is at risk and due today.')))
    assert.equal(brief.sentences[brief.sentences.length - 1], "Let's yap it done.")
    // Checks that metadata is attached
    assert.equal(brief.stats.eventCount, 2)
  })

  await t.test('mode: now includes completed counts, countdown or schedule status', () => {
    const brief = buildBrief(state, 'now', 'Kishlay')
    assert.equal(brief.title, 'Rest of today')
    assert.equal(brief.mode, 'now')
    assert.ok(brief.sentences.length >= 4)
    // Should mention completed count
    assert.ok(brief.sentences.some((s) => s.includes("You've knocked out 1 task already")))
    assert.ok(brief.sentences.some((s) => s.includes('Design fest poster')))
    assert.ok(brief.sentences.some((s) => s.includes('College Fest is at risk and due today.')))
    assert.ok(brief.sentences.some((s) => s.includes('Keep the momentum going.') || s.includes("You're in great shape")))
  })

  await t.test('mode: evening wraps up day and previews tomorrow', () => {
    const brief = buildBrief(state, 'evening', 'Kishlay')
    assert.equal(brief.title, 'Evening wrap')
    assert.equal(brief.mode, 'evening')
    assert.ok(brief.sentences.length >= 4)
    assert.ok(brief.sentences[0].includes('Good evening, Kishlay.'))
    assert.ok(brief.sentences.some((s) => s.includes('You finished 1 thing today')))
    assert.ok(brief.sentences.some((s) => s.includes('still open')))
    assert.ok(brief.sentences.some((s) => s.includes('Tomorrow starts with Kickoff tomorrow at 11 AM')))
    assert.equal(brief.sentences[brief.sentences.length - 1], 'Rest well.')
  })
})
