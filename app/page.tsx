'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import CharacterGrid from '@/components/CharacterGrid'
import QuizSession from '@/components/QuizSession'
import { getAllChars, getCharByGlyph } from '@/lib/kana/data'
import { createLocalStorageAdapter } from '@/lib/storage/local'
import type { KanaChar } from '@/lib/kana/data'
import type { Score } from '@/lib/quiz/types'

type View = 'selecting' | 'quizzing'

export default function Home() {
  const [view, setView] = useState<View>('selecting')
  const [selectedGlyphs, setSelectedGlyphs] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)
  const adapterRef = useRef(
    createLocalStorageAdapter(
      typeof window !== 'undefined' ? window.localStorage : ({} as Storage),
    ),
  )

  // Load selection from storage on mount
  useEffect(() => {
    adapterRef.current.getCharacterSelection().then(stored => {
      setSelectedGlyphs(stored)
      setLoaded(true)
    })
  }, [])

  // Save to storage on changes (once loaded)
  useEffect(() => {
    if (loaded) {
      adapterRef.current.setCharacterSelection(selectedGlyphs)
    }
  }, [selectedGlyphs, loaded])

  const handleSelectionChange = useCallback((glyphs: Set<string>) => {
    setSelectedGlyphs(glyphs)
  }, [])

  const handleStartQuiz = useCallback(() => {
    const chars: KanaChar[] = []
    for (const glyph of selectedGlyphs) {
      const char = getCharByGlyph(glyph)
      if (char) chars.push(char)
    }
    if (chars.length === 0) return
    // Store the quiz chars in a ref-like way
    // We'll pass them directly to QuizSession
    setQuizChars(chars)
    setView('quizzing')
  }, [selectedGlyphs])

  const [quizChars, setQuizChars] = useState<KanaChar[]>([])

  const handleFinish = useCallback((_score: Score) => {
    // Could show a notification or update history here
  }, [])

  const handleBack = useCallback(() => {
    setView('selecting')
  }, [])

  if (view === 'quizzing') {
    return (
      <main className="min-h-screen py-8">
        <QuizSession
          chars={quizChars}
          onFinish={handleFinish}
          onBack={handleBack}
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

      {/* Start Quiz button */}
      <div className="text-center mt-6">
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
      </div>
    </main>
  )
}
