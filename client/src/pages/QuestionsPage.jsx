import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function QuestionsPage() {
  const { api } = useAuth()
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')
  const [level, setLevel] = useState('Beginner')

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await api.get(`/questions/adaptive?level=${level}`)
        setQuestions(response.data)
      } catch (err) {
        setError('Unable to load adaptive questions')
      }
    }
    loadQuestions()
  }, [api, level])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Practice</p>
            <h1 className="text-3xl font-semibold text-white">Adaptive questions</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Level</label>
            <select value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="grid gap-4">
          {questions.length ? questions.map((question, idx) => (
            <div key={question._id} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
                <span>{question.subject}</span>
                <span>{question.difficulty}</span>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">{idx + 1}. {question.text}</p>
              <div className="mt-4 grid gap-3 text-slate-200">
                {question.options.map((option) => (
                  <div key={option} className="rounded-2xl bg-slate-950/80 px-4 py-3">{option}</div>
                ))}
              </div>
            </div>
          )) : <p className="text-slate-400">Loading questions...</p>}
        </div>
      </div>
    </main>
  )
}
