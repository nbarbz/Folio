import { useState } from 'react'
import { FileText, Loader2, Copy, Check } from 'lucide-react'
import { generateCoverLetter } from '@/lib/ai'
import type { Resume } from '@/types'

interface CoverLetterBuilderProps {
  resume: Resume
  isPro: boolean
  onShowPaywall: () => void
}

export function CoverLetterBuilder({ resume, isPro, onShowPaywall }: CoverLetterBuilderProps) {
  const [targetCompany, setTargetCompany] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [tone, setTone] = useState<'professional' | 'conversational' | 'confident'>('professional')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
        <div className="bg-amber-50 rounded-2xl p-8 max-w-sm">
          <FileText size={32} className="text-amber-400 mx-auto mb-3" />
          <h3 className="font-serif text-xl text-gray-800 mb-2">Cover Letter Builder</h3>
          <p className="text-sm text-gray-500 mb-5">
            Generate a tailored cover letter in seconds — matched to the job description, written in your voice.
          </p>
          <button
            onClick={onShowPaywall}
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Unlock with Pro
          </button>
        </div>
      </div>
    )
  }

  async function handleGenerate() {
    if (!targetCompany || !targetRole) {
      setError('Please enter the company and role you\'re applying to.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await generateCoverLetter({
        name: resume.personal.name,
        title: resume.personal.title,
        company: targetCompany,
        role: targetRole,
        jobDescription,
        keyExperience: resume.experience.slice(0, 2).map(e => `${e.role} at ${e.company}`).join(', '),
        tone,
      })
      setLetter(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputCls = "w-full text-sm px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-800 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors"

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="font-serif text-xl text-gray-800">Cover Letter Builder</h2>
        <p className="text-xs text-gray-400 mt-0.5">AI-generated, tailored to the job — edit as needed</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Target company</label>
            <input
              className={inputCls}
              value={targetCompany}
              onChange={e => setTargetCompany(e.target.value)}
              placeholder="Google"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Target role</label>
            <input
              className={inputCls}
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="Senior Product Designer"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Job description (paste key parts)</label>
          <textarea
            className={inputCls + ' min-h-[80px] resize-y'}
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the job description or key requirements here..."
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Tone</label>
          <div className="flex gap-2">
            {(['professional', 'conversational', 'confident'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  tone === t
                    ? 'bg-teal-50 border-teal-200 text-teal-600 font-medium'
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-70 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
            : 'Generate cover letter'
          }
        </button>
      </div>

      {letter && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Your cover letter</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copied ? <><Check size={12} className="text-teal-500" /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{letter}</div>
        </div>
      )}
    </div>
  )
}
