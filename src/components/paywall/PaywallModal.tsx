import { X, Sparkles, Check, Lock } from 'lucide-react'
import { redirectToCheckout } from '@/lib/stripe'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

interface PaywallModalProps {
  feature?: string
  onClose: () => void
}

const FEATURE_MESSAGES: Record<string, { title: string; desc: string }> = {
  templates: {
    title: 'Premium templates',
    desc: 'Stand out with 12+ professionally designed templates crafted to beat ATS systems and impress recruiters.',
  },
  score: {
    title: 'Resume score',
    desc: 'Get AI-powered scoring on impact, clarity, and ATS fit — with specific recommendations to improve.',
  },
  cover_letter: {
    title: 'Cover letter builder',
    desc: 'Generate a tailored cover letter in seconds, matched to the job description and your experience.',
  },
  ai: {
    title: 'AI writing assistant',
    desc: 'Let AI rewrite your bullet points to be stronger, more impactful, and keyword-optimized.',
  },
  export: {
    title: 'PDF export',
    desc: 'Download your resume as a polished, print-ready PDF — accepted by every applicant tracking system.',
  },
  default: {
    title: 'Unlock Folio Pro',
    desc: 'Get everything you need to land your next role — AI writing, premium templates, scoring, and more.',
  },
}

const PRO_FEATURES = [
  'AI-written bullet points & summaries',
  '12+ premium resume templates',
  'Cover letter builder',
  'Resume score & ATS analysis',
  'Unlimited PDF exports',
  'Unlimited resumes',
]

export function PaywallModal({ feature = 'default', onClose }: PaywallModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { title, desc } = FEATURE_MESSAGES[feature] || FEATURE_MESSAGES.default

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      await redirectToCheckout(user?.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 px-6 pt-6 pb-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-teal-600 hover:text-teal-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="bg-teal-500 rounded-lg p-1.5">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">Pro plan</span>
          </div>

          <h2 className="font-serif text-2xl text-gray-900 mb-1">{title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-serif text-4xl text-gray-900">$12</span>
            <span className="text-sm text-gray-500">/ month</span>
            <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
              7-day free trial
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-4">
          <ul className="space-y-2.5">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                <Check size={15} className="text-teal-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          {error && (
            <p className="text-xs text-red-500 mb-3 text-center">{error}</p>
          )}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-70 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Redirecting to checkout…' : 'Start free 7-day trial'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Cancel anytime · No commitment
          </p>
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-1 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pro gate wrapper ─────────────────────────────────────────────────────────

interface ProGateProps {
  isPro: boolean
  feature?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProGate({ isPro, feature = 'default', children, fallback }: ProGateProps) {
  const [showPaywall, setShowPaywall] = useState(false)

  if (isPro) return <>{children}</>

  return (
    <>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowPaywall(true)}
        title="Upgrade to Pro"
      >
        <div className="pointer-events-none opacity-60">{fallback || children}</div>
        <div className="absolute top-1 right-1">
          <Lock size={12} className="text-amber-500" />
        </div>
      </div>
      {showPaywall && (
        <PaywallModal feature={feature} onClose={() => setShowPaywall(false)} />
      )}
    </>
  )
}
