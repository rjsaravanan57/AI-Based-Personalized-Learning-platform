import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LandingPage() {
  const { user, api } = useAuth()
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const pendingTasks = useMemo(() => todos.filter((task) => task.status === 'pending'), [todos])
  const completedTasks = useMemo(() => todos.filter((task) => task.status === 'completed'), [todos])

  const loadTodos = async () => {
    try {
      const response = await api.get('/todos')
      setTodos(response.data)
    } catch (err) {
      setError('Unable to load tasks')
    }
  }

  useEffect(() => {
    if (!user) return
    loadTodos()
  }, [user])

  useEffect(() => {
    if (!user) return
    const interval = window.setInterval(() => {
      const overdue = todos.find((task) => task.status === 'pending' && task.reminderTime && new Date(task.reminderTime) <= new Date())
      setNotice(overdue ? `You still have a pending task: ${overdue.title}` : '')
    }, 15000)
    return () => window.clearInterval(interval)
  }, [todos, user])

  const handleAddTask = async (event) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('Task title is required')
      return
    }
    try {
      const response = await api.post('/todos', { title: title.trim(), reminderMinutes: reminderMinutes !== '' ? Number(reminderMinutes) : undefined })
      setTodos((prev) => [response.data, ...prev])
      setTitle('')
      setReminderMinutes('')
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save task')
    }
  }

  const handleToggleComplete = async (task) => {
    try {
      const response = await api.put(`/todos/${task._id}`, { status: task.status === 'pending' ? 'completed' : 'pending' })
      setTodos((prev) => prev.map((item) => (item._id === task._id ? response.data : item)))
    } catch {
      setError('Unable to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/todos/${taskId}`)
      setTodos((prev) => prev.filter((task) => task._id !== taskId))
    } catch {
      setError('Unable to delete task')
    }
  }

  if (!user) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-900/80 px-6 py-10 shadow-glow sm:px-12 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-200">AI-powered learning for every career path</p>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">Personalized learning, assessment, and career guidance in one platform.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Diagnose strengths, uncover gaps, and follow a tailored roadmap that matches your goals. Built for students, teachers, and career builders.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Get started</Link>
                <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-950/70 px-6 py-3 text-sm text-slate-100 transition hover:border-slate-500">Sign in</Link>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-700/60 bg-slate-950/90 p-6 shadow-xl shadow-cyan-500/10">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Start smarter</p>
                <p className="mt-3 text-2xl font-semibold text-white">Adaptive assessments</p>
                <p className="mt-3 text-slate-400">Instant insights into your current level and the exact topics to strengthen first.</p>
              </div>
              <div className="rounded-3xl border border-slate-700/60 bg-slate-950/90 p-6 shadow-xl shadow-cyan-500/10">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Plan your path</p>
                <p className="mt-3 text-2xl font-semibold text-white">Roadmaps that evolve</p>
                <p className="mt-3 text-slate-400">From study sessions to career moves, keep your progress aligned with your goals.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Assess Knowledge</h2>
            <p className="mt-4 text-slate-400">Take a diagnostic test to identify strengths, knowledge gaps, and personalized learning targets.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Personalized Roadmap</h2>
            <p className="mt-4 text-slate-400">Get a roadmap built from your assessment results, interests, and career plans.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Track Progress</h2>
            <p className="mt-4 text-slate-400">Monitor scores, completed topics, and exam readiness in one clean dashboard.</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Welcome back</p>
            <h1 className="text-3xl font-semibold text-white">Welcome back, {user.name}</h1>
            <p className="mt-3 text-slate-400">Your productivity view is ready. Stay on top of today’s tasks and reminders.</p>
          </div>
          <div className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Today</div>
        </div>

        {notice && <p className="mb-6 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{notice}</p>}
        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
              <h2 className="text-xl font-semibold text-white">Pending tasks</h2>
              {pendingTasks.length ? (
                <div className="mt-6 space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-950/80 px-4 py-4">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        {task.reminderTime && (
                          <p className="mt-1 text-sm text-slate-400">Reminds at {new Date(task.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(task)}
                          className="rounded-2xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task._id)}
                          className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-slate-400">No pending tasks. Add one to stay productive.</p>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
              <h2 className="text-xl font-semibold text-white">Add a new task</h2>
              <form onSubmit={handleAddTask} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Task title</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-slate-400">Remind me in</label>
                    <input
                      type="number"
                      min="0"
                      value={reminderMinutes}
                      onChange={(event) => setReminderMinutes(event.target.value)}
                      placeholder="Minutes"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Add task
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
            <h2 className="text-xl font-semibold text-white">Completed tasks</h2>
            {completedTasks.length ? (
              <div className="mt-6 space-y-3">
                {completedTasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-950/80 px-4 py-4">
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-400">Completed on {new Date(task.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task._id)}
                      className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-400">No completed tasks yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
