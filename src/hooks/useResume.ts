import { useState, useCallback, useRef } from 'react'
import { updateResume } from '@/lib/supabase'
import type { Resume, Experience, Education, Skill } from '@/types'

const AUTOSAVE_DELAY = 1500 // ms

export function useResume(initial: Resume) {
  const [resume, setResume] = useState<Resume>(initial)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async (data: Resume) => {
    setSaving(true)
    try {
      await updateResume(data.id, {
        title: data.title,
        template: data.template,
        personal: data.personal,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
      })
      setLastSaved(new Date())
    } catch (err) {
      console.error('Failed to save resume:', err)
    } finally {
      setSaving(false)
    }
  }, [])

  const updateAndSave = useCallback((updater: (prev: Resume) => Resume) => {
    setResume(prev => {
      const next = updater(prev)

      // Debounced autosave
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => save(next), AUTOSAVE_DELAY)

      return next
    })
  }, [save])

  // ─── Personal info ──────────────────────────────────────────────────────────

  const updatePersonal = useCallback((field: string, value: string) => {
    updateAndSave(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }))
  }, [updateAndSave])

  // ─── Experience ─────────────────────────────────────────────────────────────

  const addExperience = useCallback(() => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      period: '',
      description: '',
      bullets: [],
    }
    updateAndSave(prev => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }, [updateAndSave])

  const updateExperience = useCallback((id: string, field: string, value: string | string[]) => {
    updateAndSave(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }))
  }, [updateAndSave])

  const removeExperience = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }))
  }, [updateAndSave])

  // ─── Education ──────────────────────────────────────────────────────────────

  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      period: '',
    }
    updateAndSave(prev => ({
      ...prev,
      education: [...prev.education, newEdu],
    }))
  }, [updateAndSave])

  const updateEducation = useCallback((id: string, field: string, value: string) => {
    updateAndSave(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }))
  }, [updateAndSave])

  const removeEducation = useCallback((id: string) => {
    updateAndSave(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }))
  }, [updateAndSave])

  // ─── Skills ─────────────────────────────────────────────────────────────────

  const setSkillsFromString = useCallback((csv: string) => {
    const skills: Skill[] = csv
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => ({ id: crypto.randomUUID(), name }))
    updateAndSave(prev => ({ ...prev, skills }))
  }, [updateAndSave])

  // ─── Template ───────────────────────────────────────────────────────────────

  const setTemplate = useCallback((template: Resume['template']) => {
    updateAndSave(prev => ({ ...prev, template }))
  }, [updateAndSave])

  // ─── Bulk replace (e.g. AI import) ──────────────────────────────────────────

  const replaceResume = useCallback((updater: (prev: Resume) => Resume) => {
    updateAndSave(updater)
  }, [updateAndSave])

  return {
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
    setResume,
  }
}
