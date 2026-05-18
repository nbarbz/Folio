import { forwardRef } from 'react'
import type { Resume } from '@/types'

interface ResumePreviewProps {
  resume: Resume
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resume }, ref) => {
    const { personal, experience, education, skills } = resume

    return (
      <div
        ref={ref}
        id="resume-print-area"
        className="bg-white w-full max-w-[680px] mx-auto p-10 text-gray-800"
        style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '900px' }}
      >
        {/* Header */}
        <div className="mb-5">
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', lineHeight: 1.2, color: '#1a1a18' }}>
            {personal.name || 'Your Name'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {[personal.title, personal.location].filter(Boolean).join(' · ')}
          </p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
          </div>
        </div>

        {/* Summary */}
        {personal.summary && (
          <>
            <hr style={{ borderColor: '#1D9E75', borderWidth: '1.5px', marginBottom: '10px' }} />
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{personal.summary}</p>
          </>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <>
            <hr style={{ borderColor: '#1D9E75', borderWidth: '1.5px', marginBottom: '8px' }} />
            <div className="text-[10px] font-medium tracking-widest uppercase text-teal-500 mb-3">
              Experience
            </div>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-800">{exp.company || 'Company'}</span>
                  <span className="text-xs text-gray-400">{exp.period}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1.5">{exp.role}</div>
                {exp.bullets.length > 0 ? (
                  <ul className="list-none pl-0 space-y-0.5">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-600 leading-relaxed flex gap-1.5">
                        <span className="text-teal-400 flex-shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : exp.description ? (
                  <ul className="list-none pl-0 space-y-0.5">
                    {exp.description.split(/[.\n]/).filter(s => s.trim().length > 10).slice(0, 4).map((s, i) => (
                      <li key={i} className="text-xs text-gray-600 leading-relaxed flex gap-1.5">
                        <span className="text-teal-400 flex-shrink-0">•</span>
                        <span>{s.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </>
        )}

        {/* Education */}
        {education.length > 0 && (
          <>
            <hr style={{ borderColor: '#1D9E75', borderWidth: '1.5px', marginBottom: '8px' }} />
            <div className="text-[10px] font-medium tracking-widest uppercase text-teal-500 mb-3">
              Education
            </div>
            {education.map(edu => (
              <div key={edu.id} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-800">{edu.institution || 'Institution'}</span>
                  <span className="text-xs text-gray-400">{edu.period}</span>
                </div>
                <div className="text-xs text-gray-500">{edu.degree}</div>
              </div>
            ))}
          </>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <>
            <hr style={{ borderColor: '#1D9E75', borderWidth: '1.5px', marginBottom: '8px' }} />
            <div className="text-[10px] font-medium tracking-widest uppercase text-teal-500 mb-2">
              Skills
            </div>
            <div className="text-xs text-gray-600 leading-loose">
              {skills.map(s => s.name).join(' · ')}
            </div>
          </>
        )}
      </div>
    )
  }
)

ResumePreview.displayName = 'ResumePreview'
