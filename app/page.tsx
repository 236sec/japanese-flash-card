'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import CharacterGrid from '@/components/CharacterGrid'
import DirectionToggle from '@/components/DirectionToggle'
import QuizSession from '@/components/QuizSession'
import ScoreHistory from '@/components/ScoreHistory'
import { getCharByGlyph } from '@/lib/kana/data'
import { createLocalStorageAdapter } from '@/lib/storage/local'
import type { KanaChar } from '@/lib/kana/data'
import type { Score, Direction, ScoreEntry, MissEntry } from '@/lib/quiz/types'

type View = 'selecting' | 'quizzing' | 'history'

export default function Home() {
  const [view, setView] = useState<View>('selecting')
  const [selectedGlyphs, setSelectedGlyphs] = useState<Set<string>>(new Set())
  const [direction, setDirection] = useState<Direction>('kana→romaji')
  const [quizChars, setQuizChars] = useState<KanaChar[]>([])
  const [scoreHistory, setScoreHistory] = useState<ScoreEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const adapterRef = useRef(
    createLocalStorageAdapter(
      typeof window !== 'undefined' ? window.localStorage : ({} as Storage),
    ),
  )

  // Load from storage on mount
  useEffect(() => {
    Promise.all([
      adapterRef.current.getCharacterSelection(),
      adapterRef.current.getDirection(),
      adapterRef.current.getScoreHistory(),
    ]).then(([storedChars, storedDirection, storedHistory]) => {
      setSelectedGlyphs(storedChars)
      setDirection(storedDirection)
      setScoreHistory(storedHistory)
      setLoaded(true)
    })
  }, [])

  // Save selection to storage on changes (once loaded)
  useEffect(() => {
    if (loaded) {
      adapterRef.current.setCharacterSelection(selectedGlyphs)
    }
  }, [selectedGlyphs, loaded])

  // Save direction to storage on changes (once loaded)
  useEffect(() => {
    if (loaded) {
      adapterRef.current.setDirection(direction)
    }
  }, [direction, loaded])

  const handleSelectionChange = useCallback((glyphs: Set<string>) => {
    setSelectedGlyphs(glyphs)
  }, [])

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    setDirection(newDirection)
  }, [])

  const handleStartQuiz = useCallback(() => {
    const chars: KanaChar[] = []
    for (const glyph of selectedGlyphs) {
      const char = getCharByGlyph(glyph)
      if (char) chars.push(char)
    }
    if (chars.length === 0) return
    setQuizChars(chars)
    setView('quizzing')
  }, [selectedGlyphs])

  const handleFinish = useCallback(
    (score: Score) => {
      const entry: ScoreEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        direction,
        total: score.total,
        correct: score.correct,
        incorrect: score.incorrect,
        elapsedMs: score.elapsedMs,
        misses: score.misses.map(m => ({
          glyph: m.glyph,
          romaji: m.romaji,
        })),
      }

      // Persist and update local state
      adapterRef.current.addScoreEntry(entry).then(() => {
        setScoreHistory(prev => [...prev, entry])
      })
    },
    [direction],
  )

  const handleBack = useCallback(() => {
    setView('selecting')
  }, [])

  const handleViewHistory = useCallback(() => {
    setView('history')
  }, [])

  const handleRetryFromHistory = useCallback(
    (misses: MissEntry[]) => {
      const chars: KanaChar[] = []
      for (const miss of misses) {
        const char = getCharByGlyph(miss.glyph)
        if (char) chars.push(char)
      }
      if (chars.length === 0) return
      setQuizChars(chars)
      setDirection(direction)
      setView('quizzing')
    },
    [direction],
  )

  if (view === 'quizzing') {
    return (
      <main className="min-h-screen py-8">
        <QuizSession
          chars={quizChars}
          direction={direction}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      </main>
    )
  }

  if (view === 'history') {
    return (
      <main className="min-h-screen py-8">
        <ScoreHistory
          entries={scoreHistory}
          onBack={handleBack}
          onRetry={handleRetryFromHistory}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8">
      <CharacterGrid
        selectedGlyphs={selectedGlyphs}
        onSelectionChange={handleSelectionChange}
      />

      {/* Direction toggle */}
      <div className="mt-6">
        <DirectionToggle value={direction} onChange={handleDirectionChange} />
      </div>

      {/* Bottom buttons */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {/* Start Quiz button */}
        {!loaded ? (
          <p className="text-gray-400 text-sm">Loading your saved selection…</p>
        ) : selectedGlyphs.size === 0 ? (
          <p className="text-gray-400 text-sm">
            Select characters above to start practicing
          </p>
        ) : (
          <button
            type="button"
            onClick={handleStartQuiz}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium
                       text-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Start Quiz ({selectedGlyphs.size} character
            {selectedGlyphs.size !== 1 ? 's' : ''})
          </button>
        )}

        {/* Score History button */}
        <button
          type="button"
          onClick={handleViewHistory}
          className="px-6 py-2 text-sm bg-white border border-gray-300
                     text-gray-600 rounded-lg font-medium
                     hover:bg-gray-50 transition-colors"
        >
          Score History
        </button>
      </div>
    </main>
  )
}
