import { useState } from 'react'
import {
  User, Briefcase, GraduationCap, Wrench, ChevronDown, ChevronUp,
  Plus, Trash2, Sparkles, Loader2
} from 'lucide-react'
import { improveBullets, improveSummary } from '@/lib/ai'
import type { Resume } from '@/types'

interface EditorFormProps {
  resume: Resume
  isPro: boolean
  onUpdatePersonal: (field: string, value: string) => void
  onUpdateExperience: (id: string, field: string, value: string | string[]) => void
  onAddExperience: () => void
  onRemoveExperience: (id: string) => void
  onUpdateEducation: (id: string, field: string, value: string) => void
  onAddEducation: () => void
  onRemoveEducation: (id: string) => void
  onSetSkills: (csv: string) => void
  onShowPaywall: (feature: string) => void
}

function Section({
  title, icon: Icon, children
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon size={14} className="text-gray-400" />
          {title}
        </span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-gray-50 flex flex-col gap-3">{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full text-sm px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-800 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors"

export function EditorForm({
  resume,
  isPro,
  onUpdatePersonal,
  onUpdateExperience,
  onAddExperience,
  onRemoveExperience,
  onUpdateEducation,
  onAddEducation,
  onRemoveEducation,
  onSetSkills,
  onShowPaywall,
}: EditorFormProps) {
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  async function handleImproveBullets(expId: string) {
    if (!isPro) { onShowPaywall('ai'); return }

    const exp = resume.experience.find(e => e.id === expId)
    if (!exp) return

    setAiLoading(expId)
    try {
      const bullets = await improveBullets(
        exp.description || exp.bullets.join('\n'),
        exp.role,
        exp.company
      )
      onUpdateExperience(expId, 'bullets', bullets)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setAiLoading(null)
    }
  }

  async function handleImproveSummary() {
    if (!isPro) { onShowPaywall('ai'); return }

    setSummaryLoading(true)
    try {
      const improved = await improveSummary(
        resume.personal.summary,
        resume.personal.name,
        resume.personal.title,
        resume.experience.map(e => ({ role: e.role, company: e.company }))
      )
      onUpdatePersonal('summary', improved)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Personal Info */}
      <Section title="Personal info" icon={User}>
        <Field label="Full name">
          <input
            className={inputCls}
            value={resume.personal.name}
            onChange={e => onUpdatePersonal('name', e.target.value)}
            placeholder="Jordan Alvarez"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Title">
            <input
              className={inputCls}
              value={resume.personal.title}
              onChange={e => onUpdatePersonal('title', e.target.value)}
              placeholder="Product Designer"
            />
          </Field>
          <Field label="Email">
            <input
              className={inputCls}
              value={resume.personal.email}
              onChange={e => onUpdatePersonal('email', e.target.value)}
              placeholder="you@email.com"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Phone">
            <input
              className={inputCls}
              value={resume.personal.phone}
              onChange={e => onUpdatePersonal('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </Field>
          <Field label="Location">
            <input
              className={inputCls}
              value={resume.personal.location}
              onChange={e => onUpdatePersonal('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
          </Field>
        </div>
        <Field label="LinkedIn / Website">
          <input
            className={inputCls}
            value={resume.personal.linkedin}
            onChange={e => onUpdatePersonal('linkedin', e.target.value)}
            placeholder="linkedin.com/in/yourname"
          />
        </Field>
        <Field label="Professional summary">
          <textarea
            className={inputCls + ' min-h-[80px] resize-y'}
            value={resume.personal.summary}
            onChange={e => onUpdatePersonal('summary', e.target.value)}
            placeholder="Brief 2-3 sentence professional summary..."
          />
          <button
            onClick={handleImproveSummary}
            disabled={summaryLoading}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg w-fit transition-colors ${
              isPro
                ? 'bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100'
                : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {summaryLoading
              ? <><Loader2 size={12} className="animate-spin" /> Improving…</>
              : <><Sparkles size={12} /> {isPro ? 'Improve with AI' : '🔒 Improve with AI'}</>
            }
          </button>
        </Field>
      </Section>

      {/* Experience */}
      <Section title="Experience" icon={Briefcase}>
        {resume.experience.map((exp) => (
          <div key={exp.id} className="border border-gray-100 rounded-lg p-3 flex flex-col gap-2 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Company">
                <input
                  className={inputCls}
                  value={exp.company}
                  onChange={e => onUpdateExperience(exp.id, 'company', e.target.value)}
                  placeholder="Stripe"
                />
              </Field>
              <Field label="Period">
                <input
                  className={inputCls}
                  value={exp.period}
                  onChange={e => onUpdateExperience(exp.id, 'period', e.target.value)}
                  placeholder="2022 – Present"
                />
              </Field>
            </div>
            <Field label="Role">
              <input
                className={inputCls}
                value={exp.role}
                onChange={e => onUpdateExperience(exp.id, 'role', e.target.value)}
                placeholder="Senior Designer"
              />
            </Field>
            <Field label="Description">
              <textarea
                className={inputCls + ' min-h-[64px] resize-y'}
                value={exp.description}
                onChange={e => onUpdateExperience(exp.id, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements..."
              />
            </Field>
            {exp.bullets.length > 0 && (
              <div className="text-xs text-gray-500 bg-white rounded-lg p-2 border border-gray-100">
                <div className="font-medium text-gray-400 mb-1">AI-generated bullets:</div>
                {exp.bullets.map((b, i) => (
                  <div key={i} className="flex gap-1 mb-0.5">
                    <span className="text-teal-500">•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleImproveBullets(exp.id)}
                disabled={aiLoading === exp.id}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isPro
                    ? 'bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                {aiLoading === exp.id
                  ? <><Loader2 size={12} className="animate-spin" /> Writing…</>
                  : <><Sparkles size={12} /> {isPro ? 'Generate bullets' : '🔒 Generate bullets'}</>
                }
              </button>
              <button
                onClick={() => onRemoveExperience(exp.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Remove experience"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={onAddExperience}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <Plus size={14} /> Add experience
        </button>
      </Section>

      {/* Education */}
      <Section title="Education" icon={GraduationCap}>
        {resume.education.map((edu) => (
          <div key={edu.id} className="border border-gray-100 rounded-lg p-3 flex flex-col gap-2 bg-gray-50">
            <Field label="Institution">
              <input
                className={inputCls}
                value={edu.institution}
                onChange={e => onUpdateEducation(edu.id, 'institution', e.target.value)}
                placeholder="UC Berkeley"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Degree">
                <input
                  className={inputCls}
                  value={edu.degree}
                  onChange={e => onUpdateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="B.S. Computer Science"
                />
              </Field>
              <Field label="Period">
                <input
                  className={inputCls}
                  value={edu.period}
                  onChange={e => onUpdateEducation(edu.id, 'period', e.target.value)}
                  placeholder="2018 – 2022"
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onRemoveEducation(edu.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Remove education"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={onAddEducation}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <Plus size={14} /> Add education
        </button>
      </Section>

      {/* Skills */}
      <Section title="Skills" icon={Wrench}>
        <Field label="Skills (comma separated)">
          <input
            className={inputCls}
            value={resume.skills.map(s => s.name).join(', ')}
            onChange={e => onSetSkills(e.target.value)}
            placeholder="React, TypeScript, Figma, Python..."
          />
        </Field>
      </Section>
    </div>
  )
}
