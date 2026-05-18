import { useState } from 'react'
import { signInWithGoogle } from '@/lib/supabase'
import { Sparkles, FileText, BarChart2, Layout, CheckCircle2, Loader2 } from 'lucide-react'

export function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="font-serif text-2xl text-gray-900">
          Folio<span className="text-teal-500">.</span>
        </div>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={12} />
            AI-powered resume builder
          </div>

          <h1 className="font-serif text-5xl md:text-6xl text-gray-900 leading-tight mb-4">
            Land your next role<br />
            <span className="text-teal-500">faster.</span>
          </h1>

          <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
            Build a professional resume in minutes. Let AI write your bullet points, score your resume, and craft your cover letter.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 font-medium px-6 py-3 rounded-2xl shadow-sm hover:shadow transition-all text-sm"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
                </svg>
              )}
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-gray-400">Free to get started · No credit card required</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: Sparkles,
              title: 'AI writing assistant',
              desc: 'Generate impact-driven bullet points and a professional summary — tailored to your experience.',
              pro: true,
            },
            {
              icon: Layout,
              title: 'Premium templates',
              desc: '12+ professionally designed templates built to pass ATS systems and impress recruiters.',
              pro: true,
            },
            {
              icon: BarChart2,
              title: 'Resume score',
              desc: 'Get a score on impact, clarity, and ATS fit — with specific recommendations to improve.',
              pro: true,
            },
            {
              icon: FileText,
              title: 'Cover letter builder',
              desc: 'Generate a tailored cover letter in seconds, matched to the job description.',
              pro: true,
            },
          ].map(feature => (
            <div
              key={feature.title}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4"
            >
              <div className="bg-teal-50 rounded-xl p-2.5 h-fit">
                <feature.icon size={18} className="text-teal-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-800">{feature.title}</h3>
                  {feature.pro && (
                    <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-medium">Pro</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing teaser */}
        <div className="mt-12 bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="font-serif text-3xl text-gray-900 mb-1">
            $12 <span className="text-lg text-gray-400 font-sans font-normal">/ month</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Everything included. Cancel anytime.</p>
          <ul className="text-sm text-gray-600 space-y-2 text-left mb-6">
            {[
              'AI bullet points & summaries',
              '12+ premium templates',
              'Cover letter builder',
              'Resume score & ATS analysis',
              'Unlimited PDF exports',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            Start free 7-day trial
          </button>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-300 py-6">
        Built with React, Supabase & Anthropic · © 2024 Folio
      </footer>
    </div>
  )
}
