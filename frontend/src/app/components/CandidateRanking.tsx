import { useState, useEffect } from 'react'
import { Tag } from './KPICard'
import { Mail, X, ChevronDown, ChevronUp, Briefcase, Users, MapPin, Phone, Linkedin, Github, Code, GraduationCap, Award, Trophy, Medal, Calendar, FileText, MapPinIcon, Mail as MailIcon, Cpu, Rocket, Crown, Handshake, Globe, Target, Link, Clock, CheckCircle2 } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts'

const BASE = import.meta.env.VITE_API_URL ?? ''

const card = 'bg-white rounded-xl'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

function apiFetch(path: string, options: RequestInit = {}) {
  const t = localStorage.getItem('hireai_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any ?? {}) }
  if (t) headers['Authorization'] = `Bearer ${t}`
  return fetch(`${BASE}${path}`, { ...options, headers }).then(r => r.json())
}

// ── Schedule Interview Modal ───────────────────────────────────────────────
function ScheduleModal({ candidate, onClose, onScheduled }: {
  candidate: any
  onClose: () => void
  onScheduled: () => void
}) {
  const [scheduledAt, setScheduledAt] = useState('')
  const [location, setLocation] = useState('Video Call')
  const [meetLink, setMeetLink] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledAt) { setError('Please select a date and time.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/interviews/', {
        method: 'POST',
        body: JSON.stringify({
          application_id: candidate.application_id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          location,
          meet_link: meetLink || null,
          notes: notes || null,
        }),
      })
      if (res.detail) { setError(res.detail); return }
      setSuccess(true)
      setTimeout(() => { onScheduled(); onClose() }, 1800)
    } catch {
      setError('Failed to schedule interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ border: '1px solid #e2e8f0' }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule Interview</h3>
              <p className="text-xs text-slate-500 mt-0.5">An email will be sent to <strong>{candidate.name}</strong></p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
          </div>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
              <p className="text-sm font-bold text-slate-900">Interview Scheduled!</p>
              <p className="text-xs text-slate-500 mt-1">Confirmation email sent to {candidate.email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date &amp; Time *</label>
                <input type="datetime-local" value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  style={{ color: '#0f172a' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="Video Call / Office address"
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    style={{ color: '#0f172a' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Google Meet / Zoom Link</label>
                <div className="relative">
                  <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={meetLink} onChange={e => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    style={{ color: '#0f172a' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes for Candidate</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} placeholder="Interview format, what to prepare, etc."
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  style={{ color: '#0f172a' }} />
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                  <Calendar size={12} />
                  {loading ? 'Scheduling…' : 'Schedule & Send Email'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      {score}%
    </span>
  )
}

const rankIcon = (i: number) => {
  if (i === 0) return <Trophy size={16} className="text-yellow-500" />
  if (i === 1) return <Medal size={16} className="text-slate-400" />
  if (i === 2) return <Medal size={16} className="text-amber-600" />
  return <span className="text-sm font-bold text-slate-500">#{i + 1}</span>
}

function CandidateRow({ c, onInvite, onReject, invited, rejected }: {
  c: any; onInvite: () => void; onReject: () => void; invited: boolean; rejected: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    technical: false,
    experience: false,
    projects: false,
    leadership: false,
    softSkills: false,
    achievements: false,
    onlinePresence: false,
  })

  const toggleCard = (card: string) => {
    setExpandedCards(prev => ({ ...prev, [card]: !prev[card] }))
  }

  // ATS score (skill match %) is the sole ranking signal — always show it.
  const displayScore = Math.round(c.ats_score ?? 0)
  const hasComprehensiveMatch = !!c.comprehensive_match

  const radarData = [
    { subject: 'ATS Score',      A: c.ats_score ?? 0 },
    { subject: 'Experience',     A: Math.min((c.experience ?? 0) * 10, 100) },
    { subject: 'Matched Skills', A: c.matched_skills?.length > 0 ? Math.min(c.matched_skills.length * 20, 100) : 0 },
    { subject: 'Education',      A: c.education ? 75 : 30 },
    { subject: 'Profile',        A: c.location ? 70 : 40 },
  ]

  return (
    <>
      {showSchedule && (
        <ScheduleModal
          candidate={c}
          onClose={() => setShowSchedule(false)}
          onScheduled={() => { onInvite(); setShowSchedule(false) }}
        />
      )}
      <div className="rounded-xl overflow-hidden transition-all" style={{ border: '1px solid #e2e8f0' }}>
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
        <div className="min-w-[32px] text-center">{rankIcon(c.rank - 1)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900">{c.name}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}>
              {c.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {c.role || '—'} · {c.experience ?? 0} yrs · {c.education || '—'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ScoreBadge score={displayScore} />
          {hasComprehensiveMatch && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-600 border border-purple-200 flex items-center gap-1">
              <Target size={10} /> AI Match
            </span>
          )}
          <span className="text-[10px] text-slate-400 hidden sm:block flex items-center gap-1">
            <Calendar size={10} /> {c.applied_date}
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setShowSchedule(true)} disabled={invited}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
              style={{
                background: invited ? '#ecfdf5' : '#eef2ff',
                border: `1px solid ${invited ? '#6ee7b7' : '#c7d2fe'}`,
                color: invited ? '#10b981' : '#6366f1',
              }}>
              <Calendar size={10} />{invited ? 'Scheduled' : 'Schedule'}
            </button>
            {!rejected && (
              <button onClick={onReject}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-200">
                <X size={10} />
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-4 py-4 bg-slate-50"
          style={{ borderColor: '#e2e8f0' }}>
          
          {/* Comprehensive Match Analysis */}
          {hasComprehensiveMatch && c.comprehensive_match && (
            <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-purple-900 flex items-center gap-2">
                  <Target size={16} className="text-purple-600" /> AI-Powered Comprehensive Match Analysis
                </p>
                <span className="text-lg font-extrabold text-purple-600">{c.comprehensive_match.overall_score}%</span>
              </div>
              
              <p className="text-xs text-purple-700 mb-3 font-medium">
                {c.comprehensive_match.recommendation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Technical Skills */}
                <div className="bg-white rounded-lg border border-emerald-200 overflow-hidden">
                  <button 
                    onClick={() => toggleCard('technical')}
                    className="w-full p-3 text-left hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Cpu size={12} className="text-emerald-600" /> TECHNICAL SKILLS
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-emerald-600">
                          {c.comprehensive_match.breakdown.technical_skills.score}%
                        </span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${expandedCards.technical ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500">{c.comprehensive_match.breakdown.technical_skills.weight} weight</p>
                    <p className="text-[10px] text-slate-700 mt-1">
                      ✓ {c.comprehensive_match.breakdown.technical_skills.total_matched}/{c.comprehensive_match.breakdown.technical_skills.total_required} skills matched
                    </p>
                  </button>
                  {expandedCards.technical && (
                    <div className="px-3 pb-3 border-t border-emerald-100 bg-emerald-50">
                      <p className="text-[9px] font-bold text-emerald-700 mt-2 mb-1">✓ Matched Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {c.comprehensive_match.breakdown.technical_skills.matched_skills.map((skill: string) => (
                          <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                      {c.comprehensive_match.breakdown.technical_skills.missing_skills.length > 0 && (
                        <>
                          <p className="text-[9px] font-bold text-red-600 mt-2 mb-1">✗ Missing Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {c.comprehensive_match.breakdown.technical_skills.missing_skills.map((skill: string) => (
                              <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                  <button 
                    onClick={() => toggleCard('experience')}
                    className="w-full p-3 text-left hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Briefcase size={12} className="text-blue-600" /> EXPERIENCE
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-blue-600">
                          {c.comprehensive_match.breakdown.experience.score}%
                        </span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${expandedCards.experience ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500">{c.comprehensive_match.breakdown.experience.weight} weight</p>
                    <p className="text-[10px] text-slate-700 mt-1">{c.comprehensive_match.breakdown.experience.feedback}</p>
                  </button>
                  {expandedCards.experience && (
                    <div className="px-3 pb-3 border-t border-blue-100 bg-blue-50">
                      <div className="mt-2 space-y-1 text-[10px]">
                        <p className="text-blue-900">
                          <span className="font-bold">Candidate:</span> {c.comprehensive_match.breakdown.experience.candidate_experience} years
                        </p>
                        <p className="text-blue-900">
                          <span className="font-bold">Required:</span> {c.comprehensive_match.breakdown.experience.required_experience}
                        </p>
                        <p className="text-blue-700 mt-2 font-medium">
                          {c.comprehensive_match.breakdown.experience.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                  <button 
                    onClick={() => toggleCard('projects')}
                    className="w-full p-3 text-left hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Rocket size={12} className="text-amber-600" /> PROJECTS
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-amber-600">
                          {c.comprehensive_match.breakdown.projects.score}%
                        </span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${expandedCards.projects ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500">{c.comprehensive_match.breakdown.projects.weight} weight</p>
                    <p className="text-[10px] text-slate-700 mt-1">{c.comprehensive_match.breakdown.projects.feedback}</p>
                  </button>
                  {expandedCards.projects && c.comprehensive_match.breakdown.projects.relevant_projects.length > 0 && (
                    <div className="px-3 pb-3 border-t border-amber-100 bg-amber-50">
                      <div className="mt-2 space-y-2">
                        {c.comprehensive_match.breakdown.projects.relevant_projects.map((proj: any, i: number) => (
                          <div key={i} className="bg-white p-2 rounded border border-amber-200">
                            <p className="text-[10px] font-bold text-amber-900">{proj.name}</p>
                            <p className="text-[9px] text-slate-600 mt-0.5">{proj.description}</p>
                            <p className="text-[9px] text-amber-700 mt-1">
                              ✓ Matched {proj.matched_skills} job-required skill(s)
                            </p>
                            {proj.tech_stack && proj.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {proj.tech_stack.slice(0, 3).map((tech: string) => (
                                  <span key={tech} className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Leadership */}
                <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                  <button 
                    onClick={() => toggleCard('leadership')}
                    className="w-full p-3 text-left hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Crown size={12} className="text-purple-600" /> LEADERSHIP
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-purple-600">
                          {c.comprehensive_match.breakdown.leadership_ownership.score}%
                        </span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${expandedCards.leadership ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500">{c.comprehensive_match.breakdown.leadership_ownership.weight} weight</p>
                    <p className="text-[10px] text-slate-700 mt-1">{c.comprehensive_match.breakdown.leadership_ownership.feedback}</p>
                  </button>
                  {expandedCards.leadership && c.comprehensive_match.breakdown.leadership_ownership.indicators.length > 0 && (
                    <div className="px-3 pb-3 border-t border-purple-100 bg-purple-50">
                      <p className="text-[9px] font-bold text-purple-700 mt-2 mb-1">Leadership Indicators:</p>
                      <ul className="space-y-1">
                        {c.comprehensive_match.breakdown.leadership_ownership.indicators.map((indicator: string, i: number) => (
                          <li key={i} className="text-[9px] text-purple-900 flex items-start gap-1">
                            <span className="text-purple-500">•</span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Soft Skills */}
                <div className="bg-white rounded-lg border border-pink-200 overflow-hidden">
                  <button 
                    onClick={() => toggleCard('softSkills')}
                    className="w-full p-3 text-left hover:bg-pink-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Handshake size={12} className="text-pink-600" /> SOFT SKILLS
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-pink-600">
                          {c.comprehensive_match.breakdown.soft_skills.score}%
                        </span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${expandedCards.softSkills ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500">{c.comprehensive_match.breakdown.soft_skills.weight} weight</p>
                    <p className="text-[10px] text-slate-700 mt-1">{c.comprehensive_match.breakdown.soft_skills.feedback}</p>
                  </button>
                  {expandedCards.softSkills && c.comprehensive_match.breakdown.soft_skills.found_skills.length > 0 && (
                    <div className="px-3 pb-3 border-t border-pink-100 bg-pink-50">
                      <p className="text-[9px] font-bold text-pink-700 mt-2 mb-1">Identified Soft Skills:</p>
                      <div className="space-y-1">
                        {c.comprehensive_match.breakdown.soft_skills.found_skills.map((skill: any, i: number) => (
                          <div key={i} className="bg-white p-1.5 rounded border border-pink-200">
                            <p className="text-[9px] font-bold text-pink-900">{skill.skill}</p>
                            <p className="text-[8px] text-slate-600">Indicator: "{skill.indicator}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-lg border border-yellow-200 overflow-hidden">
                  <button 
                    onClick={() => toggleCard('achievements')}
                    className="w-full p-3 text-left hover:bg-yellow-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Trophy size={12} className="text-yellow-600" /> ACHIEVEMENTS
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-yellow-600">
                          {c.comprehensive_match.breakdown.achievements.score}%
                        </span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${expandedCards.achievements ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500">{c.comprehensive_match.breakdown.achievements.weight} weight</p>
                    <p className="text-[10px] text-slate-700 mt-1">{c.comprehensive_match.breakdown.achievements.feedback}</p>
                  </button>
                  {expandedCards.achievements && c.comprehensive_match.breakdown.achievements.achievements_and_certs.length > 0 && (
                    <div className="px-3 pb-3 border-t border-yellow-100 bg-yellow-50">
                      <div className="mt-2 space-y-1">
                        {c.comprehensive_match.breakdown.achievements.achievements_and_certs.map((item: any, i: number) => (
                          <div key={i} className="flex items-start gap-1.5 text-[9px]">
                            <span className="font-bold text-yellow-700 flex-shrink-0">
                              {item.type === 'Achievement' ? '🏆' : '📜'}
                            </span>
                            <div>
                              <span className="font-semibold text-yellow-900">[{item.type}]</span>
                              <span className="text-slate-700 ml-1">{item.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Online Presence - NEW 7TH CARD */}
                {c.comprehensive_match.breakdown.online_presence && (
                  <div className="bg-white rounded-lg border border-cyan-200 overflow-hidden">
                    <button 
                      onClick={() => toggleCard('onlinePresence')}
                      className="w-full p-3 text-left hover:bg-cyan-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          <Globe size={12} className="text-cyan-600" /> ONLINE PRESENCE
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-cyan-600">
                            {c.comprehensive_match.breakdown.online_presence.score}%
                          </span>
                          <ChevronDown size={12} className={`text-slate-400 transition-transform ${expandedCards.onlinePresence ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500">{c.comprehensive_match.breakdown.online_presence.weight} weight</p>
                      <p className="text-[10px] text-slate-700 mt-1">{c.comprehensive_match.breakdown.online_presence.summary}</p>
                    </button>
                    {expandedCards.onlinePresence && c.comprehensive_match.breakdown.online_presence.platforms.length > 0 && (
                      <div className="px-3 pb-3 border-t border-cyan-100 bg-cyan-50">
                        <div className="mt-2 space-y-2">
                          {c.comprehensive_match.breakdown.online_presence.platforms.map((platform: any, i: number) => (
                            <div key={i} className="bg-white p-2 rounded border border-cyan-200">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-bold text-cyan-900">{platform.platform}</p>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-semibold">
                                  {platform.score}%
                                </span>
                              </div>
                              <a href={platform.url} target="_blank" rel="noreferrer" 
                                className="text-[8px] text-cyan-600 hover:underline break-all block mb-1">
                                {platform.url}
                              </a>
                              {platform.indicators && platform.indicators.length > 0 && (
                                <ul className="space-y-0.5">
                                  {platform.indicators.map((indicator: string, j: number) => (
                                    <li key={j} className="text-[9px] text-slate-700 flex items-start gap-1">
                                      <span className="text-cyan-500">•</span>
                                      <span>{indicator}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              {c.comprehensive_match.next_steps && c.comprehensive_match.next_steps.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <p className="text-[10px] font-bold text-indigo-700 mb-2 flex items-center gap-1">
                    <FileText size={11} /> RECOMMENDED NEXT STEPS:
                  </p>
                  <ul className="space-y-1">
                    {c.comprehensive_match.next_steps.map((step: string, i: number) => (
                      <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                        <span className="text-indigo-500 font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Structured Resume Data */}
          {c.structured_resume && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText size={12} /> Extracted Resume Data
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {c.structured_resume.name && (
                    <div className="flex items-center gap-2 text-xs">
                      <Users size={12} className="text-slate-400" />
                      <span className="font-semibold text-slate-700">{c.structured_resume.name}</span>
                    </div>
                  )}
                  {c.structured_resume.email && (
                    <div className="flex items-center gap-2 text-xs">
                      <Mail size={12} className="text-slate-400" />
                      <span className="text-slate-600">{c.structured_resume.email}</span>
                    </div>
                  )}
                  {c.structured_resume.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone size={12} className="text-slate-400" />
                      <span className="text-slate-600">{c.structured_resume.phone}</span>
                    </div>
                  )}
                  {c.structured_resume.address && (
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="text-slate-600">{c.structured_resume.address}</span>
                    </div>
                  )}
                  {c.structured_resume.linkedin && (
                    <div className="flex items-center gap-2 text-xs">
                      <Linkedin size={12} className="text-blue-500" />
                      <a href={c.structured_resume.linkedin} target="_blank" rel="noreferrer" 
                        className="text-blue-600 hover:underline">{c.structured_resume.linkedin}</a>
                    </div>
                  )}
                  {c.structured_resume.github && (
                    <div className="flex items-center gap-2 text-xs">
                      <Github size={12} className="text-slate-700" />
                      <a href={c.structured_resume.github} target="_blank" rel="noreferrer" 
                        className="text-slate-700 hover:underline">{c.structured_resume.github}</a>
                    </div>
                  )}
                </div>

                {/* Summary */}
                {c.structured_resume.summary && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Summary</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.structured_resume.summary}</p>
                  </div>
                )}
              </div>

              {/* Experience */}
              {c.structured_resume.experience && c.structured_resume.experience.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Briefcase size={11} /> Experience
                  </p>
                  <div className="space-y-2">
                    {c.structured_resume.experience.map((exp: any, i: number) => (
                      <div key={i} className="text-xs border-l-2 border-indigo-200 pl-3 py-1">
                        <p className="font-semibold text-slate-800">{exp.title} {exp.company && `at ${exp.company}`}</p>
                        {exp.duration && <p className="text-[10px] text-slate-500">{exp.duration}</p>}
                        {exp.description && <p className="text-slate-600 mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {c.structured_resume.education && c.structured_resume.education.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <GraduationCap size={11} /> Education
                  </p>
                  <div className="space-y-1">
                    {c.structured_resume.education.map((edu: any, i: number) => (
                      <div key={i} className="text-xs">
                        <span className="font-semibold text-slate-800">{edu.degree}</span>
                        {edu.institution && <span className="text-slate-600"> - {edu.institution}</span>}
                        {edu.year && <span className="text-slate-500 text-[10px]"> ({edu.year})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {c.structured_resume.projects && c.structured_resume.projects.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Code size={11} /> Projects
                  </p>
                  <div className="space-y-2">
                    {c.structured_resume.projects.map((proj: any, i: number) => (
                      <div key={i} className="text-xs">
                        <p className="font-semibold text-slate-800">{proj.name}</p>
                        {proj.description && <p className="text-slate-600 mt-0.5">{proj.description}</p>}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {proj.technologies.map((tech: string) => (
                              <span key={tech} className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {c.structured_resume.certifications && c.structured_resume.certifications.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Award size={11} /> Certifications
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {c.structured_resume.certifications.map((cert: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills from structured data */}
              {c.structured_resume.skills && c.structured_resume.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Extracted Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {c.structured_resume.skills.map((skill: string) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {c.structured_resume.languages && c.structured_resume.languages.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {c.structured_resume.languages.map((lang: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Skills */}
            <div className="lg:col-span-2 space-y-3">
              {c.matched_skills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    ✓ Matched Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {c.matched_skills.map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #6ee7b7' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {c.missing_skills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    ✗ Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {c.missing_skills.map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {c.skills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">All Skills</p>
                  <div className="flex flex-wrap">
                    {c.skills.map((s: string) => <Tag key={s} label={s} />)}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                {c.location && <span className="flex items-center gap-1"><MapPin size={10} /> {c.location}</span>}
                {c.email && <span className="flex items-center gap-1"><MailIcon size={10} /> {c.email}</span>}
                {c.resume_path && (
                  <a href={c.resume_path} target="_blank" rel="noreferrer"
                    className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                    <FileText size={10} /> View Resume
                  </a>
                )}
              </div>
            </div>

            {/* Radar */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Radar</p>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export function CandidateRanking() {
  const [jobRankings, setJobRankings] = useState<any[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [invitedIds, setInvitedIds] = useState<number[]>([])
  const [rejectedIds, setRejectedIds] = useState<number[]>([])
  const [minScore, setMinScore] = useState(0)
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    apiFetch('/applications/ranking')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setJobRankings(data)
          setSelectedJobId(data[0].job_id)
        }
      })
      .catch(() => setJobRankings([]))
      .finally(() => setLoading(false))
  }, [])

  const selectedJob = jobRankings.find(j => j.job_id === selectedJobId)

  const filtered = (selectedJob?.candidates ?? [])
    .filter((c: any) => !rejectedIds.includes(c.candidate_id))
    .filter((c: any) => (c.ats_score ?? 0) >= minScore)
    .filter((c: any) => statusFilter === 'All' || c.status === statusFilter)

  const avgScore = filtered.length
    ? Math.round(filtered.reduce((s: number, c: any) => s + (c.ats_score ?? 0), 0) / filtered.length)
    : 0

  const selectStyle = { background: '#fff', border: '1px solid #e2e8f0', outline: 'none', color: '#0f172a' }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  )

  if (jobRankings.length === 0) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users size={20} className="text-indigo-600" /> Candidate Ranking
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-ranked applicants per job, sorted by ATS score.</p>
      </div>
      <div className="text-center py-16 rounded-xl bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <Users size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-700">No applicants yet</p>
        <p className="text-xs text-slate-400 mt-1">Candidates will appear here once they apply to your jobs.</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users size={20} className="text-indigo-600" /> Candidate Ranking
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-ranked applicants per job, sorted by ATS score.</p>
      </div>

      {/* Job selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {jobRankings.map(j => (
          <button key={j.job_id} onClick={() => setSelectedJobId(j.job_id)}
            className="text-left rounded-xl p-4 transition-all"
            style={{
              background: selectedJobId === j.job_id ? '#eef2ff' : '#fff',
              border: `1px solid ${selectedJobId === j.job_id ? '#6366f1' : '#e2e8f0'}`,
              boxShadow: selectedJobId === j.job_id ? '0 2px 8px rgba(99,102,241,0.15)' : 'none',
            }}>
            <div className="flex items-start gap-2">
              <Briefcase size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{j.job_title}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Briefcase size={9} /> {j.company}
                </p>
              </div>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: '#eef2ff', color: '#6366f1' }}>
                <Users size={9} className="inline mr-0.5" />{j.total_applicants}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedJob && (
        <>
          {/* Job header */}
          <div className={`${card} p-4`} style={cardStyle}>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedJob.job_title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1"><Briefcase size={9} /> {selectedJob.company}</span>
                  {selectedJob.location && <span className="flex items-center gap-1"><MapPin size={9} /> {selectedJob.location}</span>}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-4 text-center">
                {[
                  { label: 'Applicants', val: filtered.length, color: '#6366f1' },
                  { label: 'Avg ATS Score', val: `${avgScore}%`, color: '#10b981' },
                  { label: 'Top Match', val: `${filtered[0]?.ats_score ?? 0}%`, color: '#8b5cf6' },
                ].map(k => (
                  <div key={k.label}>
                    <p className="text-lg font-extrabold" style={{ color: k.color }}>{k.val}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-xl" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Min ATS:</span>
              <span className="text-xs font-bold text-slate-900 w-8">{minScore}%</span>
              <input type="range" min={0} max={100} step={5} value={minScore}
                onChange={e => setMinScore(+e.target.value)}
                className="w-24 accent-indigo-600 h-1 cursor-pointer" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs cursor-pointer" style={selectStyle}>
              {['All', 'Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Ranked list */}
          {filtered.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <Users size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No candidates match the current filters</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting the minimum score or status filter.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((c: any) => (
                <CandidateRow
                  key={c.candidate_id}
                  c={c}
                  invited={invitedIds.includes(c.candidate_id)}
                  rejected={rejectedIds.includes(c.candidate_id)}
                  onInvite={() => setInvitedIds(ids => [...ids, c.candidate_id])}
                  onReject={() => setRejectedIds(ids => [...ids, c.candidate_id])}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
