import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProgressPage() {
  const { api } = useAuth()
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await api.get('/progress')
        setProgress(response.data)
      } catch (err) {
        setError('Unable to load progress data')
      }
    }
    loadProgress()
  }, [api])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Progress</p>
            <h1 className="text-3xl font-semibold text-white">Track your growth</h1>
          </div>
          <p className="text-sm text-slate-400">See recent scores and completed topics in one place.</p>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {progress ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6">
              <h2 className="text-xl font-semibold text-white">Completed topics</h2>
              <div className="mt-4 space-y-3">
                {progress.completedTopics.length ? progress.completedTopics.map((topic) => (
                  <div key={topic} className="rounded-3xl bg-slate-950/80 px-4 py-3 text-slate-200">{topic}</div>
                )) : <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-slate-400">No topics completed yet.</div>}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6">
              <h2 className="text-xl font-semibold text-white">Score history</h2>
              <div className="mt-4 space-y-4">
                {progress.scoreHistory.length ? progress.scoreHistory.map((item) => (
                  <div key={item.date} className="space-y-3 rounded-3xl bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                )) : <p className="text-slate-400">No score history yet.</p>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Loading progress...</p>
        )}
      </div>
    </main>
  )
}
