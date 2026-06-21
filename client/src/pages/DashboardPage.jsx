import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const FOCUS_DURATION = 25 * 60
const BREAK_DURATION = 5 * 60

function formatDateKey(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().split('T')[0]
}

function normalizeStudySessions(sessions) {
  const map = new Map()

  sessions.forEach((entry) => {
    const date = entry?.date
    const minutes = Number(entry?.minutes || 0)

    if (!date || !Number.isFinite(minutes)) return

    const key = date.slice(0, 10)
    map.set(key, (map.get(key) || 0) + minutes)
  })

  return Array.from(map.entries())
    .filter(([, minutes]) => minutes > 0)
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function getMinutesForDate(sessions, date) {
  return sessions.find((entry) => entry.date === date)?.minutes || 0
}

function getGoalParts(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0)
  return {
    hours: Math.floor(safeMinutes / 60),
    minutes: safeMinutes % 60
  }
}

function computeStreakMetrics(sessions, goal) {
  const completed = new Set(
    sessions
      .filter((entry) => entry.minutes >= goal && entry.date)
      .map((entry) => entry.date)
  )

  const completedDates = [...completed].sort()

  let longest = 0
  let temp = 0
  let previous = null

  for (const date of completedDates) {
    if (!previous) {
      temp = 1
    } else {
      const prevDate = new Date(`${previous}T00:00:00`)
      const nextDate = new Date(`${date}T00:00:00`)
      const diff = Math.round((nextDate - prevDate) / (1000 * 60 * 60 * 24))
      temp = diff === 1 ? temp + 1 : 1
    }

    previous = date
    longest = Math.max(longest, temp)
  }

  let current = 0
  let cursor = new Date()
  while (completed.has(formatDateKey(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    totalCompletedDays: completedDates.length
  }
}

export default function DashboardPage() {
  const { api } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  const [hoursInput, setHoursInput] = useState('1')
  const [minutesInput, setMinutesInput] = useState('0')
  const [savingGoal, setSavingGoal] = useState(false)

  const [mode, setMode] = useState('focus')
  const [isRunning, setIsRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION)

  const addStudySession = useCallback(async (minutesToAdd) => {
    if (!profile || !minutesToAdd) return

    const nextSessions = normalizeStudySessions([
      ...(profile.studySessions || []),
      { date: formatDateKey(new Date()), minutes: minutesToAdd }
    ])

    try {
      const response = await api.put('/auth/profile', { studySessions: nextSessions })
      setProfile(response.data)
    } catch (err) {
      setError('Unable to save study session')
    }
  }, [api, profile])

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/auth/profile')
        setProfile(response.data)
      } catch (err) {
        setError('Unable to load profile')
      }
    }
    loadProfile()
  }, [api])

  useEffect(() => {
    if (profile) {
      const { hours, minutes } = getGoalParts(profile.dailyGoalMinutes || 60)
      setHoursInput(String(hours))
      setMinutesInput(String(minutes))
    }
  }, [profile])

  useEffect(() => {
    if (!isRunning) return undefined

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setIsRunning(false)

          if (mode === 'focus') {
            const completedMinutes = FOCUS_DURATION / 60
            setMode('break')
            setSecondsLeft(BREAK_DURATION)
            addStudySession(completedMinutes)
          } else {
            setMode('focus')
            setSecondsLeft(FOCUS_DURATION)
          }
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRunning, mode, addStudySession])

  const saveDailyGoal = async () => {
    const hours = Math.max(0, Number(hoursInput) || 0)
    const minutes = Math.max(0, Number(minutesInput) || 0)
    const total = hours * 60 + minutes

    if (!Number.isFinite(total) || total <= 0) {
      setError('Daily goal must be at least 1 minute')
      return
    }

    setSavingGoal(true)
    setError('')

    try {
      const response = await api.put('/auth/profile', { dailyGoalMinutes: total })
      setProfile(response.data)
    } catch (err) {
      setError('Unable to update daily goal')
    } finally {
      setSavingGoal(false)
    }
  }

  const normalizedSessions = useMemo(
    () => normalizeStudySessions(profile?.studySessions || []),
    [profile]
  )

  const todayKey = formatDateKey(new Date())
  const dailyGoal = Math.max(1, Number(profile?.dailyGoalMinutes || 60))
  const todayMinutes = getMinutesForDate(normalizedSessions, todayKey)
  const progressWidth = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100))

  const { currentStreak, longestStreak, totalCompletedDays } = useMemo(
    () => computeStreakMetrics(normalizedSessions, dailyGoal),
    [normalizedSessions, dailyGoal]
  )

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const thisYear = new Date().getFullYear()
  const yearMonthData = Array.from({ length: 12 }, (_, monthIndex) => {
    const firstDay = new Date(thisYear, monthIndex, 1).getDay()
    const daysInMonth = new Date(thisYear, monthIndex + 1, 0).getDate()
    const dayCells = []

    for (let i = 0; i < firstDay; i += 1) {
      dayCells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      dayCells.push(day)
    }

    return {
      monthIndex,
      name: monthNames[monthIndex],
      dayCells
    }
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Dashboard</p>
            <h1 className="text-3xl font-semibold text-white">Student overview</h1>
          </div>
          <p className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Welcome back</p>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {profile ? (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
                  <h2 className="text-xl font-semibold text-white">Hello, {profile.name}</h2>
                  <p className="mt-3 text-slate-400">Track your learning progress, see your strengths, and stay ahead with personalized recommendations.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Role</p>
                      <p className="mt-2 text-lg font-semibold text-white">{profile.role}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Learning style</p>
                      <p className="mt-2 text-lg font-semibold text-white">{profile.learningStyle}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6">
                    <h3 className="text-base font-semibold text-white">Education</h3>
                    <p className="mt-3 text-slate-400">{profile.educationLevel || 'Not specified'}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6">
                    <h3 className="text-base font-semibold text-white">Preferred subjects</h3>
                    <p className="mt-3 text-slate-400">{profile.interestedSubjects?.join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
                <h2 className="text-xl font-semibold text-white">Career interests</h2>
                <p className="mt-3 text-slate-400">Your next steps are tailored around these career goals.</p>
                <div className="mt-6 space-y-3">
                  {profile.careerInterests?.length ? profile.careerInterests.map((interest) => (
                    <div key={interest} className="rounded-3xl bg-slate-950/80 px-4 py-3 text-slate-200">{interest}</div>
                  )) : <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-slate-400">None specified yet.</div>}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Pomodoro timer</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {mode === 'focus' ? 'Focus' : 'Break'}
                    </h3>
                  </div>
                  <div className="rounded-full bg-slate-950/80 px-3 py-1 text-sm text-slate-300">
                    {mode === 'focus' ? '25 min' : '5 min'}
                  </div>
                </div>
                <div className="mt-6 rounded-3xl bg-slate-950/80 p-6 text-center">
                  <p className="text-6xl font-semibold text-white">{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setIsRunning((prev) => !prev)}
                    className="rounded-2xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={() => {
                      setIsRunning(false)
                      setSecondsLeft(mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION)
                    }}
                    className="rounded-2xl border border-slate-700 bg-slate-950/80 px-5 py-3 font-medium text-slate-200 transition hover:bg-slate-900"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Study statistics</p>
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Today's Study</span>
                      <span>{todayMinutes} / {dailyGoal} min</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-950">
                      <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${progressWidth}%` }} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current streak</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{currentStreak}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Longest streak</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{longestStreak}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Study days</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{totalCompletedDays}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Daily goal</label>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Hours</label>
                        <input
                          type="number"
                          min="0"
                          value={hoursInput}
                          onChange={(e) => setHoursInput(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Minutes</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={minutesInput}
                          onChange={(e) => setMinutesInput(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                        />
                      </div>
                      <button
                        onClick={saveDailyGoal}
                        disabled={savingGoal}
                        className="mt-6 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                      >
                        {savingGoal ? 'Saving' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Yearly streak</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{thisYear} study calendar</h3>
                </div>
                <span className="rounded-full bg-slate-950/80 px-3 py-1 text-sm text-slate-300">{totalCompletedDays} completed days</span>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {yearMonthData.map((month) => {
                  const completedDays = new Set(
                    normalizedSessions
                      .filter((entry) => entry.minutes >= dailyGoal)
                      .map((entry) => entry.date)
                  )

                  return (
                    <div key={month.name} className="rounded-2xl bg-slate-950/80 p-3">
                      <p className="mb-2 text-[11px] font-medium text-slate-200">{month.name}</p>
                      <div className="grid grid-cols-7 gap-1">
                        {month.dayCells.map((day, index) => {
                          const cellDate = day
                            ? `${thisYear}-${String(month.monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                            : ''
                          const isCompleted = day && completedDays.has(cellDate)
                          const isToday = day && cellDate === todayKey

                          return (
                            <div
                              key={`${month.name}-${index}`}
                              className={`flex aspect-square items-center justify-center rounded-[0.2rem] text-[8px] ${day
                                ? isCompleted
                                  ? 'bg-cyan-500 text-slate-950'
                                  : isToday
                                    ? 'bg-slate-800 text-slate-100'
                                    : 'bg-slate-900 text-slate-500'
                                : 'bg-transparent'
                                }`}
                            >
                              {day || ''}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Loading profile...</p>
        )}
      </div>
    </main>
  )
}
