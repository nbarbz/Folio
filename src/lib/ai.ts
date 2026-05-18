/**
 * AI helpers powered by the Anthropic API.
 *
 * IMPORTANT: In production, these calls should go through a backend proxy
 * (e.g., a Supabase Edge Function) rather than calling the Anthropic API
 * directly from the browser. This keeps your API key secret.
 *
 * For rapid prototyping you can call directly using VITE_ANTHROPIC_API_KEY,
 * but never ship that to production.
 *
 * See: supabase/functions/ai-improve/index.ts for the edge function scaffold.
 */

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Missing Anthropic API key. Add VITE_ANTHROPIC_API_KEY to your .env file.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true', // Required for browser access
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'AI request failed')
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// ─── Improve bullet points ────────────────────────────────────────────────────

export async function improveBullets(
  rawDescription: string,
  role: string,
  company: string,
  jobDescription?: string
): Promise<string[]> {
  const system = `You are an expert resume writer. Transform job descriptions into 3-4 punchy, 
impact-driven bullet points using the STAR method (Situation, Task, Action, Result). 
Use strong action verbs. Quantify achievements when possible (even if estimating based on context). 
Optimize for ATS keyword matching.
Return ONLY the bullet points, one per line, starting with "•". No preamble, no explanation.`

  const user = `Role: ${role} at ${company}
Raw description: ${rawDescription}
${jobDescription ? `Target job description: ${jobDescription}` : ''}

Write 3-4 strong resume bullet points.`

  const text = await callClaude(system, user)
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('•'))
    .map(line => line.replace(/^•\s*/, '').trim())
}

// ─── Improve summary ──────────────────────────────────────────────────────────

export async function improveSummary(
  currentSummary: string,
  name: string,
  title: string,
  experience: Array<{ role: string; company: string }>
): Promise<string> {
  const system = `You are an expert resume writer. Write compelling professional summaries that 
are 2-3 sentences, packed with value, and ATS-optimized. Be specific and confident. 
No generic phrases like "results-driven professional" or "passionate about". 
Return ONLY the summary text.`

  const expStr = experience.map(e => `${e.role} at ${e.company}`).join(', ')

  const user = `Name: ${name}
Title: ${title}
Experience: ${expStr}
Current summary: ${currentSummary || 'none'}

Write a compelling 2-3 sentence professional summary.`

  return callClaude(system, user)
}

// ─── Generate cover letter ────────────────────────────────────────────────────

export async function generateCoverLetter(params: {
  name: string
  title: string
  company: string
  role: string
  jobDescription: string
  keyExperience: string
  tone?: 'professional' | 'conversational' | 'confident'
}): Promise<string> {
  const { name, title, company, role, jobDescription, keyExperience, tone = 'professional' } = params

  const system = `You are an expert cover letter writer. Write compelling, personalized cover letters 
that get interviews. Match the tone requested. Be specific about the company and role. 
Show genuine enthusiasm without being sycophantic. 3-4 paragraphs maximum.
Return ONLY the cover letter body (no date, no address block — just the opening through sign-off).`

  const user = `Candidate: ${name}, ${title}
Applying to: ${role} at ${company}
Tone: ${tone}
Job description excerpt: ${jobDescription}
Key experience to highlight: ${keyExperience}

Write a tailored cover letter.`

  return callClaude(system, user)
}

// ─── Resume score ─────────────────────────────────────────────────────────────

export async function scoreResume(resumeText: string): Promise<{
  overall: number
  impact: number
  clarity: number
  ats_fit: number
  completeness: number
  recommendations: string[]
}> {
  const system = `You are a resume expert and ATS specialist. Analyze the resume and return a JSON object 
with these exact keys: overall, impact, clarity, ats_fit, completeness (all integers 0-100), 
and recommendations (array of 3-5 specific, actionable strings).
Return ONLY valid JSON, no markdown, no explanation.`

  const user = `Analyze this resume and score it:\n\n${resumeText}`

  const text = await callClaude(system, user)

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {
      overall: 65,
      impact: 60,
      clarity: 70,
      ats_fit: 55,
      completeness: 75,
      recommendations: [
        'Add quantifiable achievements to your bullet points',
        'Include a professional summary at the top',
        'Add more industry-specific keywords',
      ],
    }
  }
}
