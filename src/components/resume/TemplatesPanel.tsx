import { Lock } from 'lucide-react'
import type { TemplateId } from '@/types'

interface TemplatesPanelProps {
  current: TemplateId
  isPro: boolean
  onSelect: (id: TemplateId) => void
  onShowPaywall: () => void
}

const TEMPLATES = [
  {
    id: 'classic' as TemplateId,
    name: 'Classic',
    description: 'Clean and timeless. Works with every ATS.',
    isPro: false,
    accent: '#1D9E75',
  },
  {
    id: 'modern' as TemplateId,
    name: 'Modern',
    description: 'Two-column layout with a bold header.',
    isPro: true,
    accent: '#378ADD',
  },
  {
    id: 'executive' as TemplateId,
    name: 'Executive',
    description: 'Refined typography for senior roles.',
    isPro: true,
    accent: '#2C2C2A',
  },
  {
    id: 'creative' as TemplateId,
    name: 'Creative',
    description: 'Eye-catching design for creative fields.',
    isPro: true,
    accent: '#D4537E',
  },
]

function TemplateThumbnail({ accent }: { accent: string }) {
  return (
    <div className="w-full aspect-[8.5/11] bg-white rounded-lg border border-gray-100 p-3 overflow-hidden">
      <div className="h-3 rounded mb-2" style={{ background: accent, width: '60%' }} />
      <div className="h-1.5 bg-gray-100 rounded mb-1" style={{ width: '40%' }} />
      <div className="h-0.5 rounded mb-2" style={{ background: accent }} />
      <div className="space-y-1">
        <div className="h-1 bg-gray-100 rounded w-full" />
        <div className="h-1 bg-gray-100 rounded" style={{ width: '80%' }} />
        <div className="h-1 bg-gray-100 rounded" style={{ width: '90%' }} />
      </div>
      <div className="mt-2 h-0.5 rounded" style={{ background: accent }} />
      <div className="mt-1.5 space-y-1">
        <div className="h-1 bg-gray-100 rounded w-full" />
        <div className="h-1 bg-gray-100 rounded" style={{ width: '70%' }} />
      </div>
    </div>
  )
}

export function TemplatesPanel({ current, isPro, onSelect, onShowPaywall }: TemplatesPanelProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-serif text-xl text-gray-800">Templates</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {isPro ? 'All templates unlocked' : '3 premium templates available with Pro'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map(tmpl => {
          const locked = tmpl.isPro && !isPro
          const active = current === tmpl.id

          return (
            <button
              key={tmpl.id}
              onClick={() => {
                if (locked) { onShowPaywall(); return }
                onSelect(tmpl.id)
              }}
              className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                active
                  ? 'border-teal-400 bg-teal-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              } ${locked ? 'opacity-70' : ''}`}
            >
              <TemplateThumbnail accent={tmpl.accent} />
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{tmpl.name}</span>
                  {locked && <Lock size={12} className="text-amber-400" />}
                  {tmpl.isPro && isPro && (
                    <span className="text-[10px] bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded font-medium">Pro</span>
                  )}
                  {!tmpl.isPro && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Free</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{tmpl.description}</p>
              </div>
              {active && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
