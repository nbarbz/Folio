import { useState } from 'react'
import { Sparkles, Loader2, TrendingUp } from 'lucide-react'
import { scoreResume } from '@/lib/ai'
import type { Resume, ResumeScore } from '@/types'

interface ScorePanelProps {
  resume: Resume
  isPro: boolean
  onShowPaywall: () => void
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'bg-teal-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function resumeToText(resume: Resume): string {
  const { personal, experience, education, skills } = resume
  const lines: string[] = []

  lines.push(`${personal.name} - ${personal.title}`)
  if (personal.summary) lines.push(personal.summary)

  experience.forEach(exp => {
    lines.push(`${exp.role} at ${exp.company} (${exp.period})`)
    if (exp.description) lines.push(exp.description)
    exp.bullets.forEach(b => lines.push('• ' + b))
  })

  education.forEach(edu => {
    lines.push(`${edu.degree} - ${edu.institution} (${edu.period})`)
  })

  if (skills.length) lines.push('Skills: ' + skills.map(s => s.name).join(', '))

  return lines.join('\n')
}

export function ScorePanel({ resume, isPro, onShowPaywall }: ScorePanelProps) {
  const [score, setScore] = useState<ResumeScore | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
        <div className="bg-amber-50 rounded-2xl p-8 max-w-sm">
          <TrendingUp size={32} className="text-amber-400 mx-auto mb-3" />
          <h3 className="font-serif text-xl text-gray-800 mb-2">Resume Score</h3>
          <p className="text-sm text-gray-500 mb-5">
            Get AI-powered scoring on impact, clarity, ATS fit, and completeness — with actionable recommendations.
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

  async function handleScore() {
    setLoading(true)
    setError('')
    try {
      const text = resumeToText(resume)
      const result = await scoreResume(text)
      setScore(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl text-gray-800">Resume Score</h2>
          <p className="text-xs text-gray-400 mt-0.5">AI-powered analysis of your resume quality</p>
        </div>
        <button
          onClick={handleScore}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-70 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
            : <><Sparkles size={14} /> {score ? 'Re-analyze' : 'Analyze resume'}</>
          }
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      {score ? (
        <div className="space-y-6">
          {/* Overall score */}
          <div className="bg-teal-50 rounded-xl p-5 text-center">
            <div className="font-serif text-5xl text-teal-600 mb-1">{score.overall}</div>
            <div className="text-xs text-teal-500 font-medium uppercase tracking-wide">Overall score</div>
          </div>

          {/* Breakdown */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Breakdown</div>
            <ScoreBar label="Impact" value={score.impact} />
            <ScoreBar label="Clarity" value={score.clarity} />
            <ScoreBar label="ATS fit" value={score.ats_fit} />
            <ScoreBar label="Completeness" value={score.completeness} />
          </div>

          {/* Recommendations */}
          {score.recommendations.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Recommendations</div>
              <ul className="space-y-2.5">
                {score.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                    <span className="text-teal-400 flex-shrink-0 mt-0.5">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8">
          Click "Analyze resume" to get your score and recommendations
        </div>
      )}
    </div>
  )
}
