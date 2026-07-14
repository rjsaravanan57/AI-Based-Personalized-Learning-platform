import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function RoadmapPage() {
  const { api } = useAuth()
  const [roadmap, setRoadmap] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const response = await api.get('/roadmap')
        setRoadmap(response.data.items || [])
      } catch (err) {
        setError('Unable to load roadmap')
      }
    }
    loadRoadmap()
  }, [api])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Roadmap</p>
            <h1 className="text-3xl font-semibold text-white">Your personalized learning path</h1>
          </div>
          <p className="text-sm text-slate-400">Complete an assessment to refresh your roadmap anytime.</p>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {roadmap.length ? (
          <div className="grid gap-4">
            {roadmap.map((item, idx) => (
              <div key={`${item}-${idx}`} className="rounded-[1.75rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 text-slate-400">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">{idx + 1}</span>
                  <span className="text-sm uppercase tracking-[0.2em]">Step {idx + 1}</span>
                </div>
                <p className="mt-4 text-lg font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No roadmap available yet. Complete an assessment to generate one.</p>
        )}
      </div>
    </main>
  )
}
