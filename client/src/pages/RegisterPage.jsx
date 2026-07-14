import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', educationLevel: '', interestedSubjects: '', careerInterests: '', learningStyle: 'Mixed' })
  const [message, setMessage] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        educationLevel: form.educationLevel,
        interestedSubjects: form.interestedSubjects.split(',').map((item) => item.trim()),
        careerInterests: form.careerInterests.split(',').map((item) => item.trim()),
        learningStyle: form.learningStyle
      })
      navigate('/dashboard')
    } catch (error) {
      setMessage(error.response?.data?.error || error.message || 'Registration failed')
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-800/70 bg-slate-950/80 p-8 shadow-glow sm:p-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">Create your account</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Join AI Learning</h1>
          <p className="max-w-2xl text-slate-400">Register to unlock diagnostics, personalized roadmaps, and career suggestions designed for your learning goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none" />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Education Level</span>
              <input name="educationLevel" value={form.educationLevel} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none" placeholder="High School, College..." />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Learning Style</span>
              <select name="learningStyle" value={form.learningStyle} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none">
                <option>Visual</option>
                <option>Reading</option>
                <option>Practice</option>
                <option>Mixed</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Interested Subjects</span>
            <input name="interestedSubjects" value={form.interestedSubjects} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none" placeholder="Mathematics, Programming" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Career Interests</span>
            <input name="careerInterests" value={form.careerInterests} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none" placeholder="Technology, Analytics" />
          </label>

          {message && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{message}</p>}

          <button type="submit" className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Create account</button>
        </form>
      </div>
    </main>
  )
}
