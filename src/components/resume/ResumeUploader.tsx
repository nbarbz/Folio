import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import { X, Upload, FileText, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { parseResumeFromText, type ParsedResume } from '@/lib/ai'

interface ResumeUploaderProps {
  onClose: () => void
  onImport: (data: ParsedResume) => void
}

type Mode = 'upload' | 'paste'

const ACCEPTED_TYPES = ['.txt', '.md', '.rtf']
const MAX_BYTES = 1_000_000 // 1 MB of text is plenty for a resume

export function ResumeUploader({ onClose, onImport }: ResumeUploaderProps) {
  const [mode, setMode] = useState<Mode>('upload')
  const [pastedText, setPastedText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileText, setFileText] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback(async (file: File) => {
    setError(null)
    if (file.size > MAX_BYTES) {
      setError('File is too large. Please upload a plain-text resume under 1 MB.')
      return
    }
    try {
      const text = await file.text()
      if (!text.trim()) {
        setError('That file appears to be empty.')
        return
      }
      setFileName(file.name)
      setFileText(text)
    } catch {
      setError('Could not read that file. Try a plain-text (.txt) version instead.')
    }
  }, [])

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  async function handleParse() {
    const source = mode === 'upload' ? fileText : pastedText
    if (!source || !source.trim()) {
      setError(mode === 'upload' ? 'Pick a file first.' : 'Paste your resume text first.')
      return
    }

    setParsing(true)
    setError(null)
    try {
      const parsed = await parseResumeFromText(source)
      onImport(parsed)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not parse that resume. Try cleaning up the formatting and retry.'
      )
      setParsing(false)
    }
  }

  const canSubmit =
    !parsing && (mode === 'upload' ? !!fileText : pastedText.trim().length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-teal-500 rounded-lg p-1.5">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">
                AI import
              </span>
            </div>
            <h2 className="font-serif text-xl text-gray-900">Import your resume</h2>
            <p className="text-xs text-gray-500 mt-1">
              We'll parse it into editable sections so you can polish from there.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="px-6 pt-4">
          <div className="inline-flex bg-gray-50 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => { setMode('upload'); setError(null) }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload file
            </button>
            <button
              onClick={() => { setMode('paste'); setError(null) }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'paste' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Paste text
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {mode === 'upload' ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-teal-400 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileChange}
                className="hidden"
              />
              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <FileText size={16} className="text-teal-500" />
                  <span className="font-medium">{fileName}</span>
                  <span className="text-gray-400">— click to replace</span>
                </div>
              ) : (
                <>
                  <Upload size={22} className="text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-700 font-medium">
                    Drag a resume here, or click to browse
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Plain text works best ({ACCEPTED_TYPES.join(', ')}, max 1 MB)
                  </div>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="Paste your resume text here…"
              className="w-full h-56 px-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-teal-400 focus:bg-white transition-colors"
            />
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-500">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Existing edits will be replaced.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={parsing}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleParse}
              disabled={!canSubmit}
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              {parsing ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Parsing…
                </>
              ) : (
                <>
                  <Sparkles size={12} /> Parse with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
