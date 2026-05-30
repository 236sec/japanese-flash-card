'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createSession, submitAnswer, advance } from '@/lib/quiz/engine'
import ScoreScreen from '@/components/ScoreScreen'
import type { SessionState, Score } from '@/lib/quiz/types'
import type { KanaChar } from '@/lib/kana/data'

interface QuizSessionProps {
  chars: KanaChar[]
  onFinish: (score: Score) => void
  onBack: () => void
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const tenths = Math.floor((ms % 1000) / 100)
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`
  }
  return `${seconds}.${tenths}s`
}

export default function QuizSession({ chars, onFinish, onBack }: QuizSessionProps) {
  const [state, setState] = useState<SessionState>(() =>
    createSession(chars, 'kana→romaji'),
  )
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [sessionKey, setSessionKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef(Date.now())

  // Timer: update elapsedMs every 100ms while the session is active
  useEffect(() => {
    if (state.phase === 'finished') return

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current)
    }, 100)

    return () => clearInterval(interval)
  }, [state.phase, sessionKey])

  // Focus input on mount and after each transition
  useEffect(() => {
    if (state.phase === 'quizzing') {
      inputRef.current?.focus()
    }
  }, [state.phase])

  const currentChar =
    state.phase === 'quizzing' || state.phase === 'reviewing'
      ? state.shuffled[state.currentIndex]
      : null

  const totalChars = state.phase === 'finished' ? state.score.total : chars.length
  const answeredCount =
    state.phase === 'selecting' ? 0 : state.answered.length

  const handleSubmit = useCallback(() => {
    if (state.phase !== 'quizzing') return
    const trimmed = currentAnswer.trim()
    if (!trimmed) return

    const elapsed = Date.now() - startTimeRef.current
    const next = submitAnswer(state, trimmed, elapsed)
    setState(next)
    setCurrentAnswer('')

    if (next.phase === 'finished') {
      onFinish(next.score)
    }
  }, [state, currentAnswer, onFinish])

  const handleAdvance = useCallback(() => {
    if (state.phase !== 'reviewing') return
    const next = advance(state)
    setState(next)

    if (next.phase === 'finished') {
      onFinish(next.score)
    }
  }, [state, onFinish])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (state.phase === 'quizzing') {
          handleSubmit()
        } else if (state.phase === 'reviewing') {
          handleAdvance()
        }
      }
    },
    [state.phase, handleSubmit, handleAdvance],
  )

  const handleRetry = useCallback(
    (missedChars: KanaChar[]) => {
      const nextState = createSession(missedChars, 'kana→romaji')
      setState(nextState)
      setCurrentAnswer('')
      setElapsedMs(0)
      setSessionKey(k => k + 1)
      startTimeRef.current = Date.now()
    },
    [],
  )

  // ── Score screen ─────────────────────────────────────────────
  if (state.phase === 'finished') {
    return (
      <ScoreScreen
        score={state.score}
        answered={state.answered}
        elapsedMs={elapsedMs}
        onRetry={handleRetry}
        onBack={onBack}
      />
    )
  }

  // ── Active quiz ──────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Header: timer + progress */}
      <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
        <span>{formatTime(elapsedMs)}</span>
        <span>
          {answeredCount} / {totalChars}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${totalChars > 0 ? (answeredCount / totalChars) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Prompt */}
      {currentChar && (
        <div className="text-center mb-8">
          <div className="text-7xl font-medium mb-2 select-all">
            {currentChar.glyph}
          </div>
          <div className="text-sm text-gray-400">
            Type the romaji reading
          </div>
        </div>
      )}

      {/* Input area */}
      {state.phase === 'quizzing' && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. ka"
            autoComplete="off"
            autoFocus
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg
                       text-xl text-center font-medium
                       focus:outline-none focus:ring-2 focus:ring-blue-400
                       focus:border-blue-400 transition-colors"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!currentAnswer.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 disabled:opacity-40
                       disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </div>
      )}

      {/* Reviewing: feedback + Next button */}
      {state.phase === 'reviewing' && currentChar && (
        <div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
            <div className="text-sm text-red-500 font-medium mb-1">Incorrect</div>
            <div className="text-gray-600">
              Your answer:{' '}
              <span className="text-red-600 font-medium line-through">
                {state.lastAnswer}
              </span>
            </div>
            <div className="text-gray-600 mt-1">
              Correct:{' '}
              <span className="text-green-600 font-medium">
                {state.correctAnswer}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdvance}
            onKeyDown={handleKeyDown}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors"
            autoFocus
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
