import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-900/80 px-6 py-10 shadow-glow sm:px-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-200">AI-powered learning for every career path</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">Personalized learning, assessment, and career guidance in one platform.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Diagnose strengths, uncover gaps, and follow a tailored roadmap that matches your goals. Built for students, teachers, and career builders.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Get started</Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-950/70 px-6 py-3 text-sm text-slate-100 transition hover:border-slate-500">Sign in</Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-700/60 bg-slate-950/90 p-6 shadow-xl shadow-cyan-500/10">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Start smarter</p>
              <p className="mt-3 text-2xl font-semibold text-white">Adaptive assessments</p>
              <p className="mt-3 text-slate-400">Instant insights into your current level and the exact topics to strengthen first.</p>
            </div>
            <div className="rounded-3xl border border-slate-700/60 bg-slate-950/90 p-6 shadow-xl shadow-cyan-500/10">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Plan your path</p>
              <p className="mt-3 text-2xl font-semibold text-white">Roadmaps that evolve</p>
              <p className="mt-3 text-slate-400">From study sessions to career moves, keep your progress aligned with your goals.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Assess Knowledge</h2>
          <p className="mt-4 text-slate-400">Take a diagnostic test to identify strengths, knowledge gaps, and personalized learning targets.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Personalized Roadmap</h2>
          <p className="mt-4 text-slate-400">Get a roadmap built from your assessment results, interests, and career plans.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-800/70 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white">Track Progress</h2>
          <p className="mt-4 text-slate-400">Monitor scores, completed topics, and exam readiness in one clean dashboard.</p>
        </div>
      </section>
    </main>
  )
}
