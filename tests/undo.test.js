import test from 'node:test'
import assert from 'node:assert/strict'
import { applyActions } from '../src/lib/apply.js'
import { demoState } from '../src/lib/demo.js'

test('Planner Undo engine functionality', async (t) => {
  // Simulate the usePlanner history and commit architecture
  const createMockPlanner = (initialState) => {
    let state = { ...initialState }
    const history = []

    const commit = (fn) => {
      state = fn(state)
      return state
    }

    const snapshot = () => {
      const { events, todos, projects, ideas } = state
      history.push({
        events: [...events],
        todos: [...todos],
        projects: [...projects],
        ideas: [...ideas],
      })
      if (history.length > 30) history.shift()
    }

    const ops = {
      getState: () => state,
      canUndo: () => history.length > 0,
      undo: () => {
        const snap = history.pop()
        if (!snap) return false
        commit((s) => ({ ...s, ...snap }))
        return true
      },
      clearAll: () => {
        snapshot()
        return commit((s) => ({
          ...s,
          events: [],
          todos: [],
          projects: [],
          ideas: [],
        }))
      },
      deleteItem: (id) => {
        snapshot()
        return commit((s) => ({
          ...s,
          events: s.events.filter((x) => x.id !== id),
          todos: s.todos.filter((x) => x.id !== id),
          ideas: s.ideas.filter((x) => x.id !== id),
          projects: s.projects.filter((x) => x.id !== id),
        }))
      },
      apply: (actions) => {
        snapshot()
        let applied = []
        commit((s) => {
          const r = applyActions(s, actions)
          applied = r.applied
          return r.state
        })
        return applied
      },
    }

    return { ops, getState: () => state }
  }

  await t.test('undo restores data after clearAll()', () => {
    const initial = demoState()
    const planner = createMockPlanner(initial)

    assert.ok(planner.getState().todos.length > 0)
    assert.ok(planner.getState().events.length > 0)

    // User clears all
    planner.ops.clearAll()
    assert.strictEqual(planner.getState().todos.length, 0)
    assert.strictEqual(planner.getState().events.length, 0)
    assert.strictEqual(planner.getState().projects.length, 0)

    // User taps Undo
    const undone = planner.ops.undo()
    assert.strictEqual(undone, true)
    assert.strictEqual(planner.getState().todos.length, initial.todos.length)
    assert.strictEqual(planner.getState().events.length, initial.events.length)
    assert.strictEqual(planner.getState().projects.length, initial.projects.length)
  })

  await t.test('undo restores deleted item after deleteItem()', () => {
    const initial = demoState()
    const planner = createMockPlanner(initial)
    const targetTodo = initial.todos[0]

    planner.ops.deleteItem(targetTodo.id)
    assert.strictEqual(planner.getState().todos.some((t) => t.id === targetTodo.id), false)

    const undone = planner.ops.undo()
    assert.strictEqual(undone, true)
    assert.strictEqual(planner.getState().todos.some((t) => t.id === targetTodo.id), true)
  })

  await t.test('returns false when history is empty', () => {
    const planner = createMockPlanner(demoState())
    assert.strictEqual(planner.ops.canUndo(), false)
    assert.strictEqual(planner.ops.undo(), false)
  })
})
