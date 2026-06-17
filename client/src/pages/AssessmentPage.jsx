import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AssessmentPage() {
  const { api } = useAuth()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await api.get('/assessment/history')
        if (response.data.length) {
          setResult(response.data[0])
        }
        const bank = await api.get('/questions')
        setQuestions(bank.data)
      } catch (err) {
        setError('Unable to load assessment content')
      }
    }
    loadQuestions()
  }, [api])

  const handleOption = (questionId, option, question) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected: option,
        correct: option === question.answer,
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        questionId
      }
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const payload = Object.values(answers)
    if (payload.length !== questions.length) {
      setError('Please answer every question before submitting')
      return
    }
    try {
      const response = await api.post('/assessment/submit', { answers: payload })
      setResult(response.data.assessment)
    } catch (err) {
      setError('Assessment submission failed')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/85 p-8 shadow-glow">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Assessment</p>
          <h1 className="text-3xl font-semibold text-white">Diagnostic assessment</h1>
          <p className="max-w-2xl text-slate-400">Answer the questions to generate a better roadmap and get instant recommendations.</p>
        </div>

        {error && <p className="mb-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {questions.length ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question, idx) => (
              <section key={question._id} className="rounded-[1.75rem] border border-slate-800/70 bg-slate-900/80 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
                  <span>{question.subject} • {question.topic}</span>
                  <span className="rounded-full border border-slate-700/90 px-3 py-1">{question.difficulty}</span>
                </div>
                <p className="mt-4 text-lg font-semibold text-white">{idx + 1}. {question.text}</p>
                <div className="mt-5 grid gap-3">
                  {question.options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-700/90 bg-slate-950/80 px-4 py-3 transition hover:border-cyan-400">
                      <input type="radio" name={question._id} value={option} onChange={() => handleOption(question._id, option, question)} checked={answers[question._id]?.selected === option} className="h-4 w-4 text-cyan-400" />
                      <span className="text-slate-200">{option}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))}

            <button type="submit" className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Submit Assessment</button>
          </form>
        ) : (
          <p className="text-slate-400">Loading questions...</p>
        )}
      </div>

      {result && (
        <div className="mt-8 rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-8 shadow-glow">
          <h2 className="text-2xl font-semibold text-white">Recent assessment</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Score</p>
              <p className="mt-2 text-3xl font-semibold text-white">{result.score}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Classification</p>
              <p className="mt-2 text-3xl font-semibold text-white">{result.classification}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
