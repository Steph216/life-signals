'use client'

import { useState, useEffect } from 'react'

const loadingMessages = [
  'Reading your decision...',
  'Analyzing patterns...',
  'Mapping possible scenarios...',
  'Detecting cognitive biases...',
]

function LevelBar({ level }) {
  const widths = { Low: '25%', Medium: '55%', High: '85%' }
  const colors = { Low: '#34d399', Medium: '#fbbf24', High: '#f87171' }
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: widths[level] || '50%', backgroundColor: colors[level] || '#9ca3af' }}
        />
      </div>
      <span className="text-xs text-gray-400 w-10 text-right">{level}</span>
    </div>
  )
}

const scenarioColors = {
  'Safe Path':     { bg: 'bg-emerald-50',  border: 'border-emerald-100', label: 'text-emerald-600' },
  'Risky Path':    { bg: 'bg-red-50',      border: 'border-red-100',     label: 'text-red-500'     },
  'Balanced Path': { bg: 'bg-blue-50',     border: 'border-blue-100',    label: 'text-blue-500'    },
}

const biasScoreConfig = {
  Low:    { color: 'text-emerald-400', bar: '#34d399', width: '25%', label: 'Low Bias Influence' },
  Medium: { color: 'text-yellow-400',  bar: '#fbbf24', width: '55%', label: 'Moderate Bias Influence' },
  High:   { color: 'text-red-400',     bar: '#f87171', width: '85%', label: 'High Bias Influence' },
}

// 可展开的单个偏见卡片
function BiasItem({ bias }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="border border-gray-100 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-purple-200"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 font-medium">{bias.name}</span>
        </div>
        <span className="text-gray-300 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-purple-50 border-t border-purple-100">
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {bias.description}
          </p>
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <span className="text-xs font-semibold text-purple-500 uppercase tracking-wide">How to overcome</span>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{bias.overcome}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [visibleCards, setVisibleCards] = useState(0)

  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingMessages.length)
    }, 800)
    return () => clearInterval(interval)
  }, [isLoading])

  useEffect(() => {
    if (!result) return
    setVisibleCards(0)
    for (let i = 1; i <= 6; i++) {
      setTimeout(() => setVisibleCards(i), i * 200)
    }
  }, [result])

  const handleSubmit = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setResult(null)
    setError('')
    setLoadingStep(0)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const json = await res.json()
      if (json.success) {
        setResult(json.data)
      } else {
        setError('Analysis failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] px-4 py-16">
      <div className="w-full max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="relative w-2.5 h-2.5">
              <div className="absolute inset-0 rounded-full bg-gray-900" />
              <div className="absolute inset-0 rounded-full bg-gray-900 animate-ping opacity-30" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Life Signals</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
            What decision are<br />you facing?
          </h1>
          <p className="mt-3 text-gray-400 text-sm">AI-assisted human decision reflection system</p>
        </div>

        {/* 输入卡片 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <textarea
            className="w-full text-gray-800 placeholder-gray-300 resize-none text-base leading-relaxed focus:outline-none bg-transparent"
            rows={4}
            placeholder="e.g. Should I change my major? Should I accept this job offer?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-300">
              {input.length > 0 ? `${input.length} characters` : 'Press Enter to submit'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Analyzing...' : 'Analyze →'}
            </button>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center gap-3 px-1 py-3">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />
            <span className="text-sm text-gray-400">{loadingMessages[loadingStep]}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-500 text-sm">{error}</div>
        )}

        {result && (
          <div className="flex flex-col gap-3 mt-2">

            {/* Signal Reading */}
            {visibleCards >= 1 && result.signal && (
              <div className="bg-gray-900 rounded-2xl p-6 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-6">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Signal Reading</span>
                </div>
                <div className="mb-5">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Decision State</span>
                  <p className="mt-1 text-xl font-semibold text-white">{result.signal.state}</p>
                </div>
                <div className="space-y-3 mb-5">
                  <div>
                    <span className="text-xs text-gray-500">Uncertainty</span>
                    <LevelBar level={result.signal.uncertainty} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Emotional Load</span>
                    <LevelBar level={result.signal.emotional_load} />
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Suggested Direction</span>
                  <span className="text-sm font-medium text-emerald-400">{result.signal.direction}</span>
                </div>
              </div>
            )}

            {/* Scenario Engine */}
            {visibleCards >= 2 && result.scenarios && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Scenario Engine</span>
                </div>
                <div className="flex flex-col gap-2">
                  {result.scenarios.map((s, i) => {
                    const colors = scenarioColors[s.type] || { bg: 'bg-white', border: 'border-gray-100', label: 'text-gray-600' }
                    return (
                      <div key={i} className={`${colors.bg} border ${colors.border} rounded-2xl p-5`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{s.emoji}</span>
                          <span className={`text-xs font-semibold uppercase tracking-wide ${colors.label}`}>{s.type}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-400">Outcome</span>
                            <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{s.outcome}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">Risk</span>
                            <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{s.risk}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">Emotional Experience</span>
                            <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{s.emotion}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pros & Cons */}
            {visibleCards >= 3 && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xs">✓</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pros</span>
                  </div>
                  <ul className="space-y-2.5">
                    {result.pros.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                        <span className="text-gray-200 flex-shrink-0">—</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-xs">✗</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cons</span>
                  </div>
                  <ul className="space-y-2.5">
                    {result.cons.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                        <span className="text-gray-200 flex-shrink-0">—</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Key Risks */}
            {visibleCards >= 4 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center text-amber-400 text-xs">⚠</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Key Risks</span>
                </div>
                <ul className="space-y-2.5">
                  {result.risks.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                      <span className="text-gray-200 flex-shrink-0">—</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cognitive Bias Detection — 交互式 */}
            {visibleCards >= 5 && result.biases && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-purple-400 text-xs">◎</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cognitive Bias Detection</span>
                  </div>
                  {result.bias_score && (() => {
                    const cfg = biasScoreConfig[result.bias_score] || biasScoreConfig['Medium']
                    return (
                      <span className={`text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    )
                  })()}
                </div>

                {/* Bias Score 进度条 */}
                {result.bias_score && (() => {
                  const cfg = biasScoreConfig[result.bias_score] || biasScoreConfig['Medium']
                  return (
                    <div className="mb-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: cfg.width, backgroundColor: cfg.bar }}
                      />
                    </div>
                  )
                })()}

                <p className="text-xs text-gray-400 mb-3">点击每一项查看克服建议 ↓</p>

                <div className="space-y-2">
                  {result.biases.map((bias, i) => (
                    <BiasItem key={i} bias={bias} />
                  ))}
                </div>
              </div>
            )}

            {/* Reflection Questions */}
            {visibleCards >= 6 && (
              <div className="bg-gray-900 rounded-2xl p-5 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">?</span>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reflection Questions</span>
                </div>
                <ul className="space-y-3">
                  {result.questions.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed flex gap-3">
                      <span className="text-gray-600 flex-shrink-0 font-mono">{i + 1}.</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-300">
          Life Signals v0.6 · Your inputs are processed securely
        </p>
      </div>
    </main>
  )
}