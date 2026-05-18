// ─── Resume Types ────────────────────────────────────────────────────────────

export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  summary: string
}

export interface Experience {
  id: string
  company: string
  role: string
  period: string
  description: string
  bullets: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  period: string
  gpa?: string
}

export interface Skill {
  id: string
  name: string
  level?: 'beginner' | 'intermediate' | 'expert'
}

export interface Resume {
  id: string
  user_id: string
  title: string
  template: TemplateId
  personal: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  created_at: string
  updated_at: string
}

// ─── Template Types ───────────────────────────────────────────────────────────

export type TemplateId = 'classic' | 'modern' | 'executive' | 'creative'

export interface Template {
  id: TemplateId
  name: string
  description: string
  isPro: boolean
  preview?: string
}

// ─── User & Subscription Types ────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  is_pro: boolean
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing'
  trial_ends_at?: string
}

// ─── Resume Score Types ───────────────────────────────────────────────────────

export interface ResumeScore {
  overall: number
  impact: number
  clarity: number
  ats_fit: number
  completeness: number
  recommendations: string[]
}

// ─── AI Types ────────────────────────────────────────────────────────────────

export interface AIImprovementRequest {
  type: 'bullet' | 'summary' | 'cover_letter'
  content: string
  context?: string
  jobDescription?: string
}
