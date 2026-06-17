import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function StudyGroupPage() {
  const { api } = useAuth()
  const [matches, setMatches] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await api.get('/study-groups/match')
        setMatches(response.data.matches)
      } catch (err) {
        setError('Unable to load study group matches')
      }
    }
    loadMatches()
  }, [api])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Study groups</p>
            <h1 className="text-3xl font-semibold text-white">Find matching peers</h1>
          </div>
          <p className="text-sm text-slate-400">Collaborate with students who share your interests and goals.</p>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {matches.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {matches.map((student) => (
              <div key={student._id} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-white">{student.name}</h2>
                <p className="mt-3 text-slate-400">Subjects: {student.interestedSubjects?.join(', ') || 'N/A'}</p>
                <p className="mt-1 text-slate-400">Career interests: {student.careerInterests?.join(', ') || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No complementary study matches found yet.</p>
        )}
      </div>
    </main>
  )
}
