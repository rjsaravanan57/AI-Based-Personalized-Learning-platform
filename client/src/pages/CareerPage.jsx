import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function CareerPage() {
  const { api } = useAuth()
  const [careers, setCareers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCareers() {
      try {
        const response = await api.get('/career')
        setCareers(response.data)
      } catch (err) {
        setError('Unable to load career guidance')
      }
    }
    loadCareers()
  }, [api])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Career guidance</p>
            <h1 className="text-3xl font-semibold text-white">Explore career paths</h1>
          </div>
          <p className="text-sm text-slate-400">Recommendations are based on your assessment and interests.</p>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {careers.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {careers.map((career) => (
              <div key={career.title} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-white">{career.title}</h2>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">Recommended</span>
                </div>
                <div className="mt-4 space-y-3 text-slate-400">
                  <p><span className="font-semibold text-slate-200">Strong subjects:</span> {career.subjects.join(', ')}</p>
                  <p><span className="font-semibold text-slate-200">Interests:</span> {career.interests.join(', ')}</p>
                  <div className="space-y-2">
                    {career.improvement.map((note) => <p key={note}>• {note}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">Complete an assessment to get career suggestions.</p>
        )}
      </div>
    </main>
  )
}
