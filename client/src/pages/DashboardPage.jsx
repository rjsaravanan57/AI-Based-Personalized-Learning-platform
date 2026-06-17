import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardPage() {
  const { api } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

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
        ) : (
          <p className="text-slate-400">Loading profile...</p>
        )}
      </div>
    </main>
  )
}
