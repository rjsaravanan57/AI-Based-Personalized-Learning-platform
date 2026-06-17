import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const FOCUS_DURATION = 25 * 60
const BREAK_DURATION = 5 * 60
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function minutesToHoursMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return { hours, minutes }
}

function getSessionMap(sessions) {
  return sessions.reduce((map, entry) => {
    if (entry?.date) {
      const minutes = Number(entry.minutes) || 0
      map[entry.date] = (map[entry.date] || 0) + minutes
    }
    return map
  }, {})
}

function computeStreaks(completedDates) {
  const sorted = [...new Set(completedDates)].sort()
  let longest = 0
  let streak = 0
  let prev = null
  sorted.forEach((dateString) => {
    const current = new Date(dateString)
    if (prev) {
      const nextDay = new Date(prev)
      nextDay.setDate(nextDay.getDate() + 1)
      if (current.toISOString().slice(0, 10) === nextDay.toISOString().slice(0, 10)) {
        streak += 1
      } else {
        streak = 1
      }
    } else {
      streak = 1
    }
    longest = Math.max(longest, streak)
    prev = current
  })
  const today = new Date()
  let currentStreak = 0
  let pointer = new Date(today)
  while (true) {
    const key = formatDateKey(pointer)
    if (!sorted.includes(key)) break
    currentStreak += 1
    pointer.setDate(pointer.getDate() - 1)
  }
  return { currentStreak, longest, total: sorted.length }
}

export default function DashboardPage() {
  const { api } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [goalHours, setGoalHours] = useState(1)
  const [goalMinutes, setGoalMinutes] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [timerMode, setTimerMode] = useState('focus')
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_DURATION)
  const intervalRef = useRef(null)

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
    if (!profile) return
    const { hours, minutes } = minutesToHoursMinutes(profile.dailyGoalMinutes || 60)
    setGoalHours(hours)
    setGoalMinutes(minutes)
  }, [profile?.dailyGoalMinutes])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isRunning])

  useEffect(() => {
    if (remainingSeconds !== 0) return
    if (timerMode === 'focus') {
      const completeSession = async () => {
        try {
          const response = await api.post('/auth/profile/study-sessions', { minutes: 25 })
          setProfile(response.data)
          setStatus('Focus session completed and recorded! Take a break now.')
        } catch (err) {
          setError(err.response?.data?.error || 'Unable to save completed session')
        }
      }
      completeSession()
      setTimerMode('break')
      setRemainingSeconds(BREAK_DURATION)
    } else {
      setTimerMode('focus')
      setRemainingSeconds(FOCUS_DURATION)
    }
  }, [remainingSeconds, timerMode, api])

  const todayKey = useMemo(() => formatDateKey(new Date()), [])
  const sessionMap = useMemo(() => getSessionMap(profile?.studySessions || []), [profile])
  const todayMinutes = sessionMap[todayKey] || 0
  const dailyGoal = profile?.dailyGoalMinutes || 60
  const completedDates = useMemo(
    () => Object.keys(sessionMap).filter((date) => sessionMap[date] >= dailyGoal),
    [sessionMap, dailyGoal]
  )
  const streaks = useMemo(() => computeStreaks(completedDates), [completedDates])

  const calendarMonths = useMemo(() => {
    const months = []
    const today = new Date()
    for (let offset = 11; offset >= 0; offset -= 1) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1)
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const days = []
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day)
        const key = formatDateKey(date)
        const isFuture = date > today
        const completed = !isFuture && sessionMap[key] >= dailyGoal
        days.push({ key, label: day, status: isFuture ? 'future' : completed ? 'complete' : 'missed' })
      }
      months.push({ label: `${MONTH_NAMES[month]} ${year}`, days })
    }
    return months
  }, [sessionMap, dailyGoal])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${pad(mins)}:${pad(secs)}`
  }

  const handleSaveGoal = async () => {
    if (!profile) return
    setError('')
    setStatus('')
    const totalMinutes = Number(goalHours) * 60 + Number(goalMinutes)
    if (!Number.isInteger(totalMinutes) || totalMinutes < 1) {
      setError('Goal must be at least 1 minute')
      return
    }
    try {
      const response = await api.put('/auth/profile', { dailyGoalMinutes: totalMinutes })
      setProfile(response.data)
      setStatus('Daily goal updated.')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update daily goal')
    }
  }

  const handleGoalHoursChange = (value) => {
    setGoalHours(Number(value))
  }

  const handleGoalMinutesChange = (value) => {
    setGoalMinutes(Number(value))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Dashboard</p>
              <h1 className="text-3xl font-semibold text-white">Student overview</h1>
            </div>
            <p className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Welcome back</p>
          </div>

          {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          {status && <p className="mb-6 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{status}</p>}

          {profile ? (
            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
                  <h2 className="text-xl font-semibold text-white">Hello, {profile.name}</h2>
                  <p className="mt-3 text-slate-400">Track your learning progress, stay consistent, and manage your focus with a built-in Pomodoro timer.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Role</p>
                      <p className="mt-2 text-lg font-semibold text-white">{profile.role}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Study goal</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs uppercase tracking-[0.18em] text-slate-500">Hours</label>
                          <input
                            type="number"
                            min="0"
                            value={goalHours}
                            onChange={(event) => handleGoalHoursChange(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-[0.18em] text-slate-500">Minutes</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={goalMinutes}
                            onChange={(event) => handleGoalMinutesChange(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveGoal}
                        className="mt-4 inline-flex items-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                      >
                        Save goal
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Today</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{todayMinutes} / {dailyGoal}</p>
                    <p className="mt-1 text-slate-400">Minutes completed</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Current streak</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{streaks.currentStreak}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Longest streak</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{streaks.longest}</p>
                    <p className="mt-1 text-slate-400">Completed days: {streaks.total}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Pomodoro timer</h2>
                    <p className="mt-2 text-slate-400">Focus sessions only count when completed fully; break time is not recorded.</p>
                  </div>
                  <span className="rounded-full bg-slate-950/80 px-3 py-2 text-sm text-slate-300 uppercase tracking-[0.18em]">{timerMode}</span>
                </div>
                <div className="rounded-[1.5rem] border border-slate-800/70 bg-slate-950/80 p-8 text-center">
                  <p className="text-6xl font-semibold text-white">{formatTime(remainingSeconds)}</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsRunning((prev) => !prev)}
                      className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      {isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                      onClick={() => {
                        setIsRunning(false)
                        setTimerMode('focus')
                        setRemainingSeconds(FOCUS_DURATION)
                        setStatus('Timer reset')
                      }}
                      className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
                    >
                      Reset
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">Focus: 25 min · Break: 5 min</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Loading profile...</p>
          )}
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-6 shadow-glow">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Study streak</p>
              <h2 className="text-2xl font-semibold text-white">Yearly streak calendar</h2>
            </div>
            <p className="text-sm text-slate-400">Completed days are highlighted in green.</p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {calendarMonths.slice(0, 3).map((month) => (
                <div key={month.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{month.label}</p>
                  <div className="grid grid-cols-7 gap-1">
                    {month.days.map((day) => (
                      <div
                        key={day.key}
                        className={`h-4 w-4 rounded-sm border border-slate-800/80 ${day.status === 'complete' ? 'bg-cyan-500' : day.status === 'missed' ? 'bg-slate-900' : 'bg-slate-950/60'}`}
                        title={`${day.label} ${month.label} - ${day.status === 'complete' ? 'Completed' : day.status === 'missed' ? 'Missed' : 'Future'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {calendarMonths.slice(3, 6).map((month) => (
                <div key={month.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{month.label}</p>
                  <div className="grid grid-cols-7 gap-1">
                    {month.days.map((day) => (
                      <div
                        key={day.key}
                        className={`h-4 w-4 rounded-sm border border-slate-800/80 ${day.status === 'complete' ? 'bg-cyan-500' : day.status === 'missed' ? 'bg-slate-900' : 'bg-slate-950/60'}`}
                        title={`${day.label} ${month.label} - ${day.status === 'complete' ? 'Completed' : day.status === 'missed' ? 'Missed' : 'Future'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {calendarMonths.slice(6, 9).map((month) => (
                <div key={month.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{month.label}</p>
                  <div className="grid grid-cols-7 gap-1">
                    {month.days.map((day) => (
                      <div
                        key={day.key}
                        className={`h-4 w-4 rounded-sm border border-slate-800/80 ${day.status === 'complete' ? 'bg-cyan-500' : day.status === 'missed' ? 'bg-slate-900' : 'bg-slate-950/60'}`}
                        title={`${day.label} ${month.label} - ${day.status === 'complete' ? 'Completed' : day.status === 'missed' ? 'Missed' : 'Future'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {calendarMonths.slice(9, 12).map((month) => (
                <div key={month.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{month.label}</p>
                  <div className="grid grid-cols-7 gap-1">
                    {month.days.map((day) => (
                      <div
                        key={day.key}
                        className={`h-4 w-4 rounded-sm border border-slate-800/80 ${day.status === 'complete' ? 'bg-cyan-500' : day.status === 'missed' ? 'bg-slate-900' : 'bg-slate-950/60'}`}
                        title={`${day.label} ${month.label} - ${day.status === 'complete' ? 'Completed' : day.status === 'missed' ? 'Missed' : 'Future'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
