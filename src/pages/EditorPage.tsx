import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  Edit3, Eye, Download, Layout, BarChart2, FileText, Sparkles,
  LogOut, Crown, ChevronLeft, Save, Loader2, Upload
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useResume } from '@/hooks/useResume'
import { signOut } from '@/lib/supabase'
import { EditorForm } from '@/components/resume/EditorForm'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { ScorePanel } from '@/components/resume/ScorePanel'
import { CoverLetterBuilder } from '@/components/resume/CoverLetterBuilder'
import { TemplatesPanel } from '@/components/resume/TemplatesPanel'
import { ResumeUploader } from '@/components/resume/ResumeUploader'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import type { ParsedResume } from '@/lib/ai'
import type { Resume } from '@/types'

// Default blank resume for new users
const DEFAULT_RESUME: Resume = {
  id: 'local',
  user_id: '',
  title: 'My Resume',
  template: 'classic',
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    summary: '',
  },
  experience: [
    {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      period: '',
      description: '',
      bullets: [],
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      period: '',
    },
  ],
  skills: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

type Tab = 'edit' | 'preview' | 'templates' | 'score' | 'cover_letter'

interface NavItem {
  id: Tab
  label: string
  icon: React.ElementType
  pro: boolean
  group: 'editor' | 'tools'
}

const NAV: NavItem[] = [
  { id: 'edit', label: 'Editor', icon: Edit3, pro: false, group: 'editor' },
  { id: 'preview', label: 'Preview', icon: Eye, pro: false, group: 'editor' },
  { id: 'templates', label: 'Templates', icon: Layout, pro: true, group: 'editor' },
  { id: 'score', label: 'Resume score', icon: BarChart2, pro: true, group: 'tools' },
  { id: 'cover_letter', label: 'Cover letter', icon: FileText, pro: true, group: 'tools' },
]

export function EditorPage({ initialResume }: { initialResume?: Resume }) {
  const { user, profile, isPro } = useAuth()
  const [tab, setTab] = useState<Tab>('edit')
  const [paywall, setPaywall] = useState<string | null>(null)
  const [showUploader, setShowUploader] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const {
    resume,
    saving,
    lastSaved,
    updatePersonal,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    setSkillsFromString,
    setTemplate,
    replaceResume,
  } = useResume(initialResume || DEFAULT_RESUME)

  function handleImportResume(data: ParsedResume) {
    replaceResume(prev => ({
      ...prev,
      personal: { ...prev.personal, ...data.personal },
      experience: data.experience.length
        ? data.experience.map(e => ({ ...e, id: crypto.randomUUID() }))
        : prev.experience,
      education: data.education.length
        ? data.education.map(e => ({ ...e, id: crypto.randomUUID() }))
        : prev.education,
      skills: data.skills.length
        ? data.skills.map(name => ({ id: crypto.randomUUID(), name }))
        : prev.skills,
      updated_at: new Date().toISOString(),
    }))
    setTab('edit')
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${resume.personal.name || 'Resume'} - ${resume.personal.title}`,
  })

  function handleExport() {
    if (!isPro) { setPaywall('export'); return }
    handlePrint()
  }

  function handleTabChange(id: Tab) {
    const item = NAV.find(n => n.id === id)
    if (item?.pro && !isPro) {
      setPaywall(id)
      return
    }
    setTab(id)
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'You'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="font-serif text-xl text-gray-900">
            Folio<span className="text-teal-500">.</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <div className="text-[10px] font-medium text-gray-300 uppercase tracking-widest px-2 mb-1">Resume</div>
          {NAV.filter(n => n.group === 'editor').map(item => (
            <NavButton
              key={item.id}
              item={item}
              active={tab === item.id}
              isPro={isPro}
              onClick={() => handleTabChange(item.id)}
            />
          ))}

          <div className="text-[10px] font-medium text-gray-300 uppercase tracking-widest px-2 mb-1 mt-4">Tools</div>
          {NAV.filter(n => n.group === 'tools').map(item => (
            <NavButton
              key={item.id}
              item={item}
              active={tab === item.id}
              isPro={isPro}
              onClick={() => handleTabChange(item.id)}
            />
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          {!isPro && (
            <button
              onClick={() => setPaywall('default')}
              className="w-full mb-3 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-medium py-2 rounded-xl transition-opacity hover:opacity-90"
            >
              <Crown size={12} /> Upgrade to Pro
            </button>
          )}
          {isPro && (
            <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-teal-50 rounded-xl">
              <Crown size={12} className="text-teal-500" />
              <span className="text-xs text-teal-600 font-medium">Pro plan active</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-xs font-medium text-teal-700 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">{displayName}</div>
            </div>
            <button
              onClick={signOut}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{resume.title}</span>
            {saving && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Loader2 size={10} className="animate-spin" /> Saving…
              </span>
            )}
            {!saving && lastSaved && (
              <span className="text-xs text-gray-300">
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <Upload size={12} /> Import resume
            </button>
            <button
              onClick={() => setTab('preview')}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <Eye size={12} /> Preview
            </button>
            <button
              onClick={handleExport}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isPro
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              <Download size={12} /> Export PDF
              {!isPro && ' 🔒'}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {tab === 'edit' && (
            <div className="h-full flex">
              <div className="w-80 flex-shrink-0 overflow-y-auto p-4 border-r border-gray-100">
                <EditorForm
                  resume={resume}
                  isPro={isPro}
                  onUpdatePersonal={updatePersonal}
                  onUpdateExperience={updateExperience}
                  onAddExperience={addExperience}
                  onRemoveExperience={removeExperience}
                  onUpdateEducation={updateEducation}
                  onAddEducation={addEducation}
                  onRemoveEducation={removeEducation}
                  onSetSkills={setSkillsFromString}
                  onShowPaywall={setPaywall}
                />
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <ResumePreview ref={printRef} resume={resume} />
              </div>
            </div>
          )}

          {tab === 'preview' && (
            <div className="h-full overflow-y-auto bg-gray-100 p-8">
              <ResumePreview ref={printRef} resume={resume} />
            </div>
          )}

          {tab === 'templates' && (
            <div className="h-full overflow-y-auto">
              <TemplatesPanel
                current={resume.template}
                isPro={isPro}
                onSelect={setTemplate}
                onShowPaywall={() => setPaywall('templates')}
              />
            </div>
          )}

          {tab === 'score' && (
            <div className="h-full overflow-y-auto">
              <ScorePanel
                resume={resume}
                isPro={isPro}
                onShowPaywall={() => setPaywall('score')}
              />
            </div>
          )}

          {tab === 'cover_letter' && (
            <div className="h-full overflow-y-auto">
              <CoverLetterBuilder
                resume={resume}
                isPro={isPro}
                onShowPaywall={() => setPaywall('cover_letter')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Paywall modal */}
      {paywall !== null && (
        <PaywallModal feature={paywall} onClose={() => setPaywall(null)} />
      )}

      {/* Resume uploader modal */}
      {showUploader && (
        <ResumeUploader
          onClose={() => setShowUploader(false)}
          onImport={handleImportResume}
        />
      )}
    </div>
  )
}

function NavButton({
  item, active, isPro, onClick
}: {
  item: NavItem
  active: boolean
  isPro: boolean
  onClick: () => void
}) {
  const locked = item.pro && !isPro
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all ${
        active
          ? 'bg-teal-50 text-teal-700 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      <Icon size={15} className={active ? 'text-teal-500' : 'text-gray-400'} />
      <span className="flex-1 text-left">{item.label}</span>
      {locked && (
        <span className="text-[9px] bg-amber-100 text-amber-500 px-1.5 py-0.5 rounded font-medium">PRO</span>
      )}
    </button>
  )
}
