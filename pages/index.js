import { useState, useRef } from 'react'
import Head from 'next/head'

const GREEN = '#1D9E75'
const GREEN_DARK = '#0F6E56'

function ScoreBar({ score }) {
  const pct = (score / 10) * 100
  const color = score >= 7 ? '#1D9E75' : score >= 5 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm font-medium w-8 text-right">{score}/10</span>
    </div>
  )
}

function PillBadge({ pct }) {
  const color = pct >= 70 ? { bg: '#EAF3DE', text: '#3B6D11' } : pct >= 50 ? { bg: '#FAEEDA', text: '#854F0B' } : { bg: '#FCEBEB', text: '#A32D2D' }
  const label = pct >= 70 ? 'Strong' : pct >= 50 ? 'Developing' : 'Needs Focus'
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: color.bg, color: color.text }}>
      {pct}% — {label}
    </span>
  )
}

function ResultCard({ result, onReset }) {
  const handlePDF = async () => {
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    const G = [29, 158, 117]
    const GD = [15, 110, 86]
    const GR = [26, 26, 24]
    const GRAY = [107, 106, 101]
    const W = 612
    const M = 48

    // Header
    doc.setFillColor(...G)
    doc.rect(0, 0, W, 72, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('GIM 7 Sales Call Analysis', M, 30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`${result.repName} — ${result.callName}`, M, 50)
    doc.setFontSize(9)
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - M, 50, { align: 'right' })

    let y = 96

    // Summary box
    const pct = result.percentage
    const rating = pct >= 70 ? 'Strong' : pct >= 50 ? 'Developing' : 'Needs Focus'
    const ratingColor = pct >= 70 ? [59, 109, 17] : pct >= 50 ? [133, 79, 11] : [163, 45, 45]

    doc.setFillColor(247, 247, 245)
    doc.roundedRect(M, y, W - M * 2, 44, 4, 4, 'F')
    doc.setTextColor(...GR)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall Score', M + 12, y + 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`${result.total}/${result.maxScore} (${result.percentage}%)`, M + 12, y + 30)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ratingColor)
    doc.text(rating, M + 200, y + 23)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.text(`${result.callTypeLabel}`, M + 300, y + 23)

    y += 60

    // Verdict
    doc.setTextColor(...[15, 110, 86])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bolditalic')
    const verdictLines = doc.splitTextToSize(`"${result.verdict}"`, W - M * 2 - 12)
    doc.setDrawColor(...G)
    doc.setLineWidth(2)
    doc.line(M, y, M, y + verdictLines.length * 13)
    doc.text(verdictLines, M + 10, y + 10)
    y += verdictLines.length * 13 + 16

    // Dimension Scores
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('DIMENSION SCORES', M, y)
    doc.setDrawColor(224, 222, 216)
    doc.setLineWidth(0.5)
    doc.line(M, y + 4, W - M, y + 4)
    y += 14

    Object.entries(result.scores).forEach(([dim, sc]) => {
      doc.setTextColor(...GRAY)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.text(dim, M, y + 4)
      const barX = M + 130
      const barW = 180
      doc.setFillColor(224, 222, 216)
      doc.roundedRect(barX, y - 4, barW, 8, 2, 2, 'F')
      const fillColor = sc >= 7 ? [29, 158, 117] : sc >= 5 ? [245, 158, 11] : [239, 68, 68]
      doc.setFillColor(...fillColor)
      doc.roundedRect(barX, y - 4, (sc / 10) * barW, 8, 2, 2, 'F')
      doc.setTextColor(...GR)
      doc.setFont('helvetica', 'bold')
      doc.text(`${sc}/10`, barX + barW + 10, y + 4)
      y += 16
    })

    y += 8

    // Feedback
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('DIMENSION FEEDBACK', M, y)
    doc.line(M, y + 4, W - M, y + 4)
    y += 14

    Object.entries(result.feedback).forEach(([dim, fb]) => {
      if (y > 680) { doc.addPage(); y = 48 }
      doc.setTextColor(...GD)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(dim, M, y)
      y += 12
      doc.setTextColor(...GR)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      const lines = doc.splitTextToSize(fb, W - M * 2)
      lines.forEach(line => {
        if (y > 700) { doc.addPage(); y = 48 }
        doc.text(line, M, y)
        y += 12
      })
      y += 6
    })

    y += 4
    if (y > 640) { doc.addPage(); y = 48 }

    // Strengths
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('STRENGTHS', M, y)
    doc.line(M, y + 4, W - M, y + 4)
    y += 14

    result.strengths.forEach(s => {
      if (y > 700) { doc.addPage(); y = 48 }
      doc.setFillColor(...G)
      doc.circle(M + 4, y - 1, 2, 'F')
      doc.setTextColor(...GR)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(s, W - M * 2 - 14)
      lines.forEach((line, i) => {
        if (y > 700) { doc.addPage(); y = 48 }
        doc.text(line, M + 12, y)
        y += 12
      })
      y += 4
    })

    y += 4
    if (y > 640) { doc.addPage(); y = 48 }

    // Improvements
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('AREAS FOR IMPROVEMENT', M, y)
    doc.line(M, y + 4, W - M, y + 4)
    y += 14

    result.improvements.forEach((imp, idx) => {
      if (y > 640) { doc.addPage(); y = 48 }
      doc.setTextColor(...GD)
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'bold')
      doc.text(`${idx + 1}. ${imp.what}`, M, y)
      y += 14

      doc.setTextColor(...GR)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.text('Why it matters:', M, y)
      doc.setFont('helvetica', 'normal')
      const whyLines = doc.splitTextToSize(imp.why, W - M * 2 - 70)
      doc.text(whyLines, M + 68, y)
      y += whyLines.length * 12 + 6

      if (y > 700) { doc.addPage(); y = 48 }
      doc.setFont('helvetica', 'bold')
      doc.text('How to do it:', M, y)
      doc.setFont('helvetica', 'normal')
      const howLines = doc.splitTextToSize(imp.how, W - M * 2 - 64)
      doc.text(howLines, M + 64, y)
      y += howLines.length * 12 + 12
    })

    // Footer
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setDrawColor(224, 222, 216)
      doc.setLineWidth(0.5)
      doc.line(M, 750, W - M, 750)
      doc.setTextColor(...GRAY)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text('Scored using the GIM 7 Sales Laws framework  ·  Confidential', M, 762)
      doc.text(`Page ${i} of ${pages}`, W - M, 762, { align: 'right' })
    }

    doc.save(`GIM7_${result.repName.replace(/\s/g, '_')}_${result.callName.replace(/\s/g, '_')}.pdf`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6" style={{ background: GREEN }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">{result.repName}</h2>
              <p className="text-white/80 text-sm mt-0.5">{result.callName} · {result.callTypeLabel}</p>
            </div>
            <PillBadge pct={result.percentage} />
          </div>
          <p className="text-white/70 text-sm mt-3 italic border-l-2 border-white/40 pl-3">{result.verdict}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Scores */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dimension Scores</h3>
            <div className="space-y-2">
              {Object.entries(result.scores).map(([dim, sc]) => (
                <div key={dim} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-36 flex-shrink-0">{dim}</span>
                  <ScoreBar score={sc} />
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dimension Feedback</h3>
            <div className="space-y-3">
              {Object.entries(result.feedback).map(([dim, fb]) => (
                <div key={dim} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{dim}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{fb}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Strengths</h3>
            <div className="space-y-2">
              {result.strengths.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: GREEN }}>+</span>
                  <p className="text-sm text-gray-700">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Areas for Improvement</h3>
            <div className="space-y-4">
              {result.improvements.map((imp, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4">
                  <p className="text-sm font-bold mb-2" style={{ color: GREEN_DARK }}>{imp.what}</p>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-semibold text-gray-700">Why it matters: </span>{imp.why}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">How to do it: </span>{imp.how}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePDF}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition"
              style={{ background: GREEN }}
            >
              Download PDF Report
            </button>
            <button
              onClick={onReset}
              className="flex-1 py-3 rounded-xl text-gray-700 font-semibold text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              Analyze Another Call
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [repName, setRepName] = useState('')
  const [callName, setCallName] = useState('')
  const [inputMode, setInputMode] = useState('transcript') // 'transcript' or 'audio'
  const [transcript, setTranscript] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [step, setStep] = useState('form') // 'form' | 'transcribing' | 'analyzing' | 'result' | 'error'
  const [statusMsg, setStatusMsg] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!repName.trim() || !callName.trim()) return
    if (inputMode === 'transcript' && !transcript.trim()) return
    if (inputMode === 'audio' && !audioFile) return

    setError('')
    let finalTranscript = transcript

    if (inputMode === 'audio') {
      setStep('transcribing')
      setStatusMsg('Transcribing your audio file — this may take a minute...')
      try {
        const arrayBuffer = await audioFile.arrayBuffer()
const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
const res = await fetch('/api/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audioBase64: base64, mimeType: audioFile.type }),
})
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Transcription failed')
        finalTranscript = data.transcript
      } catch (err) {
        setStep('error')
        setError(err.message)
        return
      }
    }

    setStep('analyzing')
    setStatusMsg('Scoring the call using GIM 7 Sales Laws...')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repName, callName, transcript: finalTranscript }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
      setStep('result')
    } catch (err) {
      setStep('error')
      setError(err.message)
    }
  }

  const handleReset = () => {
    setStep('form')
    setResult(null)
    setError('')
    setTranscript('')
    setAudioFile(null)
    setRepName('')
    setCallName('')
  }

  return (
    <>
      <Head>
        <title>GIM 7 Sales Call Analyzer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: GREEN }}>G7</div>
            <span className="text-lg font-bold text-gray-800">GIM 7 Sales Call Analyzer</span>
          </div>
          <p className="text-sm text-gray-500">Powered by the GIM 7 Sales Laws framework</p>
        </div>

        {step === 'form' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5">Analyze a sales call</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Rep Name</label>
                    <input
                      value={repName}
                      onChange={e => setRepName(e.target.value)}
                      placeholder="e.g. Jay"
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': GREEN }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Call Name</label>
                    <input
                      value={callName}
                      onChange={e => setCallName(e.target.value)}
                      placeholder="e.g. Jay and Elliot"
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Input mode toggle */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Input Type</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setInputMode('transcript')}
                      className="flex-1 py-2 text-sm font-medium transition"
                      style={inputMode === 'transcript' ? { background: GREEN, color: '#fff' } : { background: '#fff', color: '#6B7280' }}
                    >
                      Paste Transcript
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('audio')}
                      className="flex-1 py-2 text-sm font-medium transition"
                      style={inputMode === 'audio' ? { background: GREEN, color: '#fff' } : { background: '#fff', color: '#6B7280' }}
                    >
                      Upload Audio
                    </button>
                  </div>
                </div>

                {inputMode === 'transcript' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Transcript</label>
                    <textarea
                      value={transcript}
                      onChange={e => setTranscript(e.target.value)}
                      placeholder="Paste the call transcript here..."
                      rows={8}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Audio File (MP3, WAV, M4A)</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition"
                    >
                      {audioFile ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{audioFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                          <button type="button" onClick={e => { e.stopPropagation(); setAudioFile(null) }} className="text-xs text-red-400 mt-2 hover:text-red-600">Remove</button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-3xl mb-2">🎵</div>
                          <p className="text-sm text-gray-500">Click to upload audio file</p>
                          <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A — max 100MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={e => setAudioFile(e.target.files[0] || null)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
                  style={{ background: GREEN }}
                >
                  Analyze Call
                </button>
              </form>
            </div>
          </div>
        )}

        {(step === 'transcribing' || step === 'analyzing') && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ background: '#EAF3DE' }}>
                <div className="w-6 h-6 rounded-full" style={{ background: GREEN }} />
              </div>
              <p className="text-sm font-semibold text-gray-700">{step === 'transcribing' ? 'Transcribing audio...' : 'Scoring the call...'}</p>
              <p className="text-xs text-gray-400 mt-1">{statusMsg}</p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-sm font-semibold text-red-600 mb-1">Something went wrong</p>
              <p className="text-xs text-gray-500 mb-4">{error}</p>
              <button onClick={handleReset} className="px-6 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: GREEN }}>Try Again</button>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <ResultCard result={result} onReset={handleReset} />
        )}
      </div>
    </>
  )
}
