import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function TeacherDashboardPage() {
  const { api } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTeacherData() {
      try {
        const response = await api.get('/teacher')
        setData(response.data)
      } catch (err) {
        setError('Unable to load teacher dashboard')
      }
    }
    loadTeacherData()
  }, [api])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Teacher dashboard</p>
            <h1 className="text-3xl font-semibold text-white">Classroom insights</h1>
          </div>
          <p className="text-sm text-slate-400">Monitor student progress and review assessment results.</p>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {data ? (
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6">
              <h2 className="text-xl font-semibold text-white">Students</h2>
              <div className="mt-5 space-y-4">
                {data.students.map((student) => (
                  <div key={student._id} className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                    <p className="font-semibold text-white">{student.name}</p>
                    <p className="text-sm text-slate-400">{student.email}</p>
                    <p className="mt-2 text-sm text-slate-400">Subjects: {student.interestedSubjects.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6">
              <h2 className="text-xl font-semibold text-white">Recent assessments</h2>
              <div className="mt-5 space-y-4">
                {data.assessments.map((assessment) => (
                  <div key={assessment._id} className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4">
                    <p className="text-sm text-slate-500">{new Date(assessment.createdAt).toLocaleDateString()}</p>
                    <p className="mt-2 text-lg font-semibold text-white">Score: {assessment.score}%</p>
                    <p className="text-sm text-slate-400">Classification: {assessment.classification}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Loading teacher data...</p>
        )}
      </div>
    </main>
  )
}
